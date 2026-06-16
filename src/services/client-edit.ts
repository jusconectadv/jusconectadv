"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createAuditLog } from "@/src/services/audit-logs";
import type { Database, Json } from "@/src/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

type ClientType = "PF" | "PJ";

type ClientChange = {
  field: string;
  before: string | null;
  after: string | null;
};

export type EditableClientResult = {
  client: ClientRow;
};

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

function getValidClientType(type: string): ClientType {
  if (type === "PJ") {
    return "PJ";
  }

  return "PF";
}

function normalizeNullableText(value: string): string | null {
  return value || null;
}

function buildClientChanges(
  currentClient: ClientRow,
  nextClient: {
    name: string;
    type: ClientType;
    document: string | null;
    email: string | null;
    phone: string | null;
  },
): ClientChange[] {
  const changes: ClientChange[] = [];

  if (currentClient.name !== nextClient.name) {
    changes.push({
      field: "name",
      before: currentClient.name,
      after: nextClient.name,
    });
  }

  if (currentClient.type !== nextClient.type) {
    changes.push({
      field: "type",
      before: currentClient.type,
      after: nextClient.type,
    });
  }

  if (currentClient.document !== nextClient.document) {
    changes.push({
      field: "document",
      before: currentClient.document,
      after: nextClient.document,
    });
  }

  if (currentClient.email !== nextClient.email) {
    changes.push({
      field: "email",
      before: currentClient.email,
      after: nextClient.email,
    });
  }

  if (currentClient.phone !== nextClient.phone) {
    changes.push({
      field: "phone",
      before: currentClient.phone,
      after: nextClient.phone,
    });
  }

  return changes;
}

async function getAuthorizedClientContext(clientId: string): Promise<{
  tenantId: string;
  actorId: string;
  client: ClientRow;
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
    .select("*")
    .eq("id", clientId)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (clientError || !client) {
    redirect("/dashboard/clients");
  }

  return {
    tenantId: context.tenant.id,
    actorId: context.user.id,
    client,
  };
}

export async function getEditableClient(
  clientId: string,
): Promise<EditableClientResult> {
  const { client } = await getAuthorizedClientContext(clientId);

  return {
    client,
  };
}

export async function updateClientDetailsAction(
  formData: FormData,
): Promise<void> {
  const clientId = getStringField(formData, "clientId");
  const name = getStringField(formData, "name");
  const type = getValidClientType(getStringField(formData, "type"));
  const document = normalizeNullableText(getStringField(formData, "document"));
  const email = normalizeNullableText(getStringField(formData, "email"));
  const phone = normalizeNullableText(getStringField(formData, "phone"));

  if (!clientId) {
    redirect("/dashboard/clients");
  }

  if (!name) {
    redirect(
      `/dashboard/clients/${clientId}/edit?error=${encodeURIComponent(
        "Nome do cliente é obrigatório.",
      )}`,
    );
  }

  const { tenantId, actorId, client } =
    await getAuthorizedClientContext(clientId);

  const admin = createSupabaseAdminClient();

  const changes = buildClientChanges(client, {
    name,
    type,
    document,
    email,
    phone,
  });

  const { error } = await admin
    .from("clients")
    .update({
      name,
      type,
      document,
      email,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", client.id)
    .eq("tenant_id", tenantId);

  if (error) {
    redirect(
      `/dashboard/clients/${clientId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  if (changes.length > 0) {
    const metadata: Json = {
      client_name: name,
      changes,
    };

    await createAuditLog({
      tenantId,
      actorId,
      action: "client_updated",
      entityType: "client",
      entityId: client.id,
      description: `Cliente "${name}" atualizado.`,
      metadata,
    });
  }

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath(`/dashboard/clients/${clientId}/edit`);
  revalidatePath("/dashboard/cases");
  revalidatePath("/dashboard/search");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/audit");
  revalidatePath("/dashboard");

  redirect(`/dashboard/clients/${clientId}?success=client-updated`);
}