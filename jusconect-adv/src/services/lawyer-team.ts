"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/supabase";

type TenantMemberRow = Database["public"]["Tables"]["tenant_members"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type TenantMemberRole = "owner" | "staff" | "client";

export type LawyerTeamMember = {
  membership: TenantMemberRow;
  profile: ProfileRow | null;
};

export type LawyerTeamResult = {
  members: LawyerTeamMember[];
};

type AuthorizedTeamContext = {
  userId: string;
  tenantId: string;
  membershipRole: string;
};

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

function isAllowedTenantRole(role: string): boolean {
  return role === "owner" || role === "staff";
}

function isOwner(role: string): boolean {
  return role === "owner";
}

function getValidTenantMemberRole(role: string): TenantMemberRole {
  if (role === "owner") {
    return "owner";
  }

  if (role === "client") {
    return "client";
  }

  return "staff";
}

async function getAuthorizedTeamContext(
  ownerOnly: boolean,
): Promise<AuthorizedTeamContext> {
  const context = await requireUserContext();

  if (!isAllowedProfileRole(context.role)) {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard");
  }

  const admin = createSupabaseAdminClient();

  const { data: membership, error: membershipError } = await admin
    .from("tenant_members")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .eq("user_id", context.user.id)
    .eq("is_active", true)
    .single();

  if (
    membershipError ||
    !membership ||
    !isAllowedTenantRole(membership.role)
  ) {
    redirect("/dashboard");
  }

  if (ownerOnly && !isOwner(membership.role)) {
    redirect("/dashboard/team?error=Apenas o proprietário pode gerenciar equipe.");
  }

  return {
    userId: context.user.id,
    tenantId: context.tenant.id,
    membershipRole: membership.role,
  };
}

export async function listLawyerTeamMembers(): Promise<LawyerTeamResult> {
  const { tenantId } = await getAuthorizedTeamContext(false);
  const admin = createSupabaseAdminClient();

  const { data: memberships, error: membershipsError } = await admin
    .from("tenant_members")
    .select("*")
    .eq("tenant_id", tenantId)
    .in("role", ["owner", "staff"])
    .order("role", { ascending: true })
    .order("created_at", { ascending: true });

  if (membershipsError) {
    throw new Error(membershipsError.message);
  }

  const safeMemberships = memberships ?? [];
  const userIds = Array.from(
    new Set(safeMemberships.map((membership) => membership.user_id)),
  );

  let profiles: ProfileRow[] = [];

  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await admin
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    profiles = profilesData ?? [];
  }

  const profilesById = new Map<string, ProfileRow>();

  profiles.forEach((profile) => {
    profilesById.set(profile.id, profile);
  });

  return {
    members: safeMemberships.map((membership) => ({
      membership,
      profile: profilesById.get(membership.user_id) ?? null,
    })),
  };
}

export async function createStaffMemberAction(
  formData: FormData,
): Promise<void> {
  const { tenantId } = await getAuthorizedTeamContext(true);
  const admin = createSupabaseAdminClient();

  const fullName = getStringField(formData, "fullName");
  const email = normalizeEmail(getStringField(formData, "email"));
  const temporaryPassword = getStringField(formData, "temporaryPassword");
  const role = getValidTenantMemberRole(getStringField(formData, "role"));

  if (!fullName || !email) {
    redirect(
      `/dashboard/team?error=${encodeURIComponent(
        "Nome e e-mail são obrigatórios.",
      )}`,
    );
  }

  if (role !== "staff") {
    redirect(
      `/dashboard/team?error=${encodeURIComponent(
        "Nesta tela só é permitido criar membros staff.",
      )}`,
    );
  }

  const { data: existingProfile, error: existingProfileError } = await admin
    .from("profiles")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  if (existingProfileError) {
    redirect(
      `/dashboard/team?error=${encodeURIComponent(existingProfileError.message)}`,
    );
  }

  let userId = existingProfile?.id ?? null;

  if (!userId) {
    if (temporaryPassword.length < 6) {
      redirect(
        `/dashboard/team?error=${encodeURIComponent(
          "Informe uma senha provisória com pelo menos 6 caracteres.",
        )}`,
      );
    }

    const { data: createdUserData, error: createdUserError } =
      await admin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

    if (createdUserError || !createdUserData.user) {
      redirect(
        `/dashboard/team?error=${encodeURIComponent(
          createdUserError?.message ?? "Erro ao criar usuário.",
        )}`,
      );
    }

    userId = createdUserData.user.id;
  }

  const { error: profileUpsertError } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      email,
      role: "lawyer",
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  if (profileUpsertError) {
    redirect(
      `/dashboard/team?error=${encodeURIComponent(
        profileUpsertError.message,
      )}`,
    );
  }

  const { data: existingMembership, error: existingMembershipError } =
    await admin
      .from("tenant_members")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();

  if (existingMembershipError) {
    redirect(
      `/dashboard/team?error=${encodeURIComponent(
        existingMembershipError.message,
      )}`,
    );
  }

  if (existingMembership) {
    const { error: updateMembershipError } = await admin
      .from("tenant_members")
      .update({
        role: "staff",
        is_active: true,
      })
      .eq("id", existingMembership.id)
      .eq("tenant_id", tenantId);

    if (updateMembershipError) {
      redirect(
        `/dashboard/team?error=${encodeURIComponent(
          updateMembershipError.message,
        )}`,
      );
    }
  } else {
    const { error: insertMembershipError } = await admin
      .from("tenant_members")
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        role: "staff",
        is_active: true,
      });

    if (insertMembershipError) {
      redirect(
        `/dashboard/team?error=${encodeURIComponent(
          insertMembershipError.message,
        )}`,
      );
    }
  }

  revalidatePath("/dashboard/team");
  redirect("/dashboard/team?success=staff-created");
}

export async function deactivateStaffMemberAction(
  formData: FormData,
): Promise<void> {
  const { tenantId, userId: currentUserId } = await getAuthorizedTeamContext(
    true,
  );

  const membershipId = getStringField(formData, "membershipId");

  if (!membershipId) {
    redirect("/dashboard/team?error=Membro inválido.");
  }

  const admin = createSupabaseAdminClient();

  const { data: membership, error: membershipError } = await admin
    .from("tenant_members")
    .select("*")
    .eq("id", membershipId)
    .eq("tenant_id", tenantId)
    .single();

  if (membershipError || !membership) {
    redirect("/dashboard/team?error=Membro não encontrado.");
  }

  if (membership.user_id === currentUserId) {
    redirect(
      "/dashboard/team?error=Você não pode desativar seu próprio acesso.",
    );
  }

  if (membership.role === "owner") {
    redirect(
      "/dashboard/team?error=O proprietário do escritório não pode ser desativado.",
    );
  }

  const { error } = await admin
    .from("tenant_members")
    .update({
      is_active: false,
    })
    .eq("id", membership.id)
    .eq("tenant_id", tenantId)
    .eq("role", "staff");

  if (error) {
    redirect(`/dashboard/team?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/team");
  redirect("/dashboard/team?success=staff-deactivated");
}

export async function reactivateStaffMemberAction(
  formData: FormData,
): Promise<void> {
  const { tenantId } = await getAuthorizedTeamContext(true);

  const membershipId = getStringField(formData, "membershipId");

  if (!membershipId) {
    redirect("/dashboard/team?error=Membro inválido.");
  }

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("tenant_members")
    .update({
      is_active: true,
    })
    .eq("id", membershipId)
    .eq("tenant_id", tenantId)
    .eq("role", "staff");

  if (error) {
    redirect(`/dashboard/team?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/team");
  redirect("/dashboard/team?success=staff-reactivated");
}