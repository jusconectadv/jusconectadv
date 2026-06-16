"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { createAuditLog } from "@/src/services/audit-logs";
import type { Database, Json } from "@/src/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

type ClientType = "PF" | "PJ";

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getValidClientType(type: string): ClientType {
  if (type === "PJ") {
    return "PJ";
  }

  return "PF";
}

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

export async function listClients(): Promise<ClientRow[]> {
  const context = await requireUserContext();

  if (!isAllowedProfileRole(context.role) || !context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return clients ?? [];
}

export async function createClientAction(formData: FormData): Promise<void> {
  const context = await requireUserContext();

  if (!isAllowedProfileRole(context.role) || !context.tenant) {
    redirect("/dashboard");
  }

  const type = getValidClientType(getStringField(formData, "type"));
  const name = getStringField(formData, "name");
  const document = getStringField(formData, "document");
  const email = getStringField(formData, "email");
  const phone = getStringField(formData, "phone");

  if (!name) {
    redirect(
      `/dashboard/clients/new?error=${encodeURIComponent(
        "Nome do cliente é obrigatório.",
      )}`,
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: createdClient, error } = await supabase
    .from("clients")
    .insert({
      tenant_id: context.tenant.id,

      // IMPORTANTE:
      // Cliente criado manualmente pelo advogado NÃO pode usar o user_id do advogado.
      // O vínculo com login do cliente acontece depois por auth_user_id/email.
      user_id: null,
      auth_user_id: null,

      type,
      name,
      document: document || null,
      email: email || null,
      phone: phone || null,
      active: true,
    })
    .select("id, name, type, document, email, phone")
    .single();

  if (error || !createdClient) {
    redirect(
      `/dashboard/clients/new?error=${encodeURIComponent(
        error?.message ?? "Erro ao criar cliente.",
      )}`,
    );
  }

  const metadata: Json = {
    client_name: createdClient.name,
    client_type: createdClient.type,
    client_document: createdClient.document,
    client_email: createdClient.email,
    client_phone: createdClient.phone,
  };

  await createAuditLog({
    tenantId: context.tenant.id,
    actorId: context.user.id,
    action: "client_created",
    entityType: "client",
    entityId: createdClient.id,
    description: `Cliente "${createdClient.name}" criado manualmente.`,
    metadata,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/search");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/audit");

  redirect(`/dashboard/clients/${createdClient.id}?success=client-created`);
}