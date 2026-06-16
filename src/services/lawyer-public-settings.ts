"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/types/supabase";

type TenantPublicSettingsRow =
  Database["public"]["Tables"]["tenant_public_settings"]["Row"];

export type LawyerPublicSettingsResult = {
  settings: TenantPublicSettingsRow | null;
};

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getBooleanField(formData: FormData, field: string): boolean {
  return formData.get(field) === "on";
}

function parsePracticeAreas(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((area) => area.trim())
    .filter((area) => area.length > 0);
}

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

function isAllowedTenantMemberRole(role: string): boolean {
  return role === "owner" || role === "staff";
}

export async function getLawyerPublicSettings(): Promise<LawyerPublicSettingsResult> {
  const context = await requireUserContext();

  if (!isAllowedProfileRole(context.role)) {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("tenant_public_settings")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a personalização pública.");
  }

  return {
    settings: data ?? null,
  };
}

export async function updateLawyerPublicSettingsAction(
  formData: FormData,
): Promise<void> {
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
    .select("role, is_active")
    .eq("tenant_id", context.tenant.id)
    .eq("user_id", context.user.id)
    .eq("is_active", true)
    .single();

  if (
    membershipError ||
    !membership ||
    !isAllowedTenantMemberRole(membership.role)
  ) {
    redirect("/dashboard/settings");
  }

  const publicTitle = getStringField(formData, "publicTitle");
  const publicSubtitle = getStringField(formData, "publicSubtitle");
  const publicDescription = getStringField(formData, "publicDescription");
  const whatsappNumber = getStringField(formData, "whatsappNumber");
  const practiceAreasRaw = getStringField(formData, "practiceAreas");
  const formIntro = getStringField(formData, "formIntro");
  const isPublicActive = getBooleanField(formData, "isPublicActive");

  const { error } = await admin.from("tenant_public_settings").upsert(
    {
      tenant_id: context.tenant.id,
      public_title: publicTitle || null,
      public_subtitle: publicSubtitle || null,
      public_description: publicDescription || null,
      whatsapp_number: whatsappNumber || null,
      practice_areas: parsePracticeAreas(practiceAreasRaw),
      form_intro: formIntro || null,
      is_public_active: isPublicActive,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "tenant_id",
    },
  );

  if (error) {
    redirect(
      `/dashboard/settings?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/settings");
  revalidatePath(`/advogado/${context.tenant.id}`);

  redirect("/dashboard/settings?success=public-settings-updated");
}