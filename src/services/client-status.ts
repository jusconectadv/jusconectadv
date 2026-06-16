"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createAuditLog } from "@/src/services/audit-logs";

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

function isAllowedTenantMemberRole(role: string): boolean {
  return role === "owner" || role === "staff";
}

async function getAuthorizedClientContext(clientId: string): Promise<{
  tenantId: string;
  actorId: string;
  clientName: string;
}> {
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
    redirect("/dashboard");
  }

  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("id, name")
    .eq("id", clientId)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (clientError || !client) {
    redirect("/dashboard/clients");
  }

  return {
    tenantId: context.tenant.id,
    actorId: context.user.id,
    clientName: client.name,
  };
}

export async function archiveClientAction(formData: FormData): Promise<void> {
  const clientId = getStringField(formData, "clientId");
  const returnTo = getStringField(formData, "returnTo");

  if (!clientId) {
    redirect("/dashboard/clients");
  }

  const { tenantId, actorId, clientName } =
    await getAuthorizedClientContext(clientId);

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("clients")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId)
    .eq("tenant_id", tenantId);

  if (error) {
    redirect(
      `/dashboard/clients/${clientId}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  await createAuditLog({
    tenantId,
    actorId,
    action: "client_archived",
    entityType: "client",
    entityId: clientId,
    description: `Cliente "${clientName}" foi arquivado.`,
    metadata: {
      client_name: clientName,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/search");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/audit");

  if (returnTo === "detail") {
    redirect(`/dashboard/clients/${clientId}?success=client-archived`);
  }

  redirect("/dashboard/clients?success=client-archived");
}

export async function restoreClientAction(formData: FormData): Promise<void> {
  const clientId = getStringField(formData, "clientId");
  const returnTo = getStringField(formData, "returnTo");

  if (!clientId) {
    redirect("/dashboard/clients");
  }

  const { tenantId, actorId, clientName } =
    await getAuthorizedClientContext(clientId);

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("clients")
    .update({
      active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId)
    .eq("tenant_id", tenantId);

  if (error) {
    redirect(
      `/dashboard/clients/${clientId}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  await createAuditLog({
    tenantId,
    actorId,
    action: "client_restored",
    entityType: "client",
    entityId: clientId,
    description: `Cliente "${clientName}" foi reativado.`,
    metadata: {
      client_name: clientName,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/search");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/audit");

  if (returnTo === "detail") {
    redirect(`/dashboard/clients/${clientId}?success=client-restored`);
  }

  redirect("/dashboard/clients?success=client-restored");
}