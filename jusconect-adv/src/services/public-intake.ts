"use server";

import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

type ClientType = "PF" | "PJ";
type CasePriority = "low" | "medium" | "high" | "urgent";

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function parseClientType(value: string): ClientType {
  if (value === "PJ") {
    return "PJ";
  }

  return "PF";
}

function parsePriority(value: string): CasePriority {
  if (value === "urgent") {
    return "urgent";
  }

  if (value === "high") {
    return "high";
  }

  if (value === "low") {
    return "low";
  }

  return "medium";
}

export async function createPublicCaseAction(
  formData: FormData,
): Promise<void> {
  const tenantId = getStringField(formData, "tenantId");
  const name = getStringField(formData, "name");
  const email = getStringField(formData, "email");
  const phone = getStringField(formData, "phone");
  const document = getStringField(formData, "document");
  const clientType = parseClientType(getStringField(formData, "clientType"));
  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const priority = parsePriority(getStringField(formData, "priority"));

  if (!tenantId) {
    redirect("/login");
  }

  if (!name || !title || !description) {
    redirect(`/advogado/${tenantId}?error=Preencha os campos obrigatórios.`);
  }

  const supabase = createSupabaseAdminClient();

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, active")
    .eq("id", tenantId)
    .eq("active", true)
    .single();

  if (tenantError || !tenant) {
    redirect(`/advogado/${tenantId}?error=Escritório não encontrado.`);
  }

  const { data: publicSettings, error: publicSettingsError } = await supabase
    .from("tenant_public_settings")
    .select("is_public_active")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (publicSettingsError) {
    redirect(
      `/advogado/${tenantId}?error=${encodeURIComponent(
        publicSettingsError.message,
      )}`,
    );
  }

  if (publicSettings && !publicSettings.is_public_active) {
    redirect(`/advogado/${tenantId}?error=Atendimento público indisponível.`);
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      tenant_id: tenant.id,
      user_id: null,
      auth_user_id: null,
      type: clientType,
      name,
      document: document || null,
      email: email || null,
      phone: phone || null,
    })
    .select("*")
    .single();

  if (clientError || !client) {
    redirect(
      `/advogado/${tenantId}?error=${encodeURIComponent(
        clientError?.message ?? "Erro ao criar cliente.",
      )}`,
    );
  }

  const publicToken = crypto.randomUUID();

  const { data: legalCase, error: caseError } = await supabase
    .from("cases")
    .insert({
      tenant_id: tenant.id,
      client_id: client.id,
      title,
      description,
      priority,
      status: "new",
      summary_ai: null,
      public_token: publicToken,
    })
    .select("*")
    .single();

  if (caseError || !legalCase) {
    redirect(
      `/advogado/${tenantId}?error=${encodeURIComponent(
        caseError?.message ?? "Erro ao criar caso.",
      )}`,
    );
  }

  const { error: messageError } = await supabase.from("messages").insert({
    tenant_id: tenant.id,
    case_id: legalCase.id,
    sender_type: "client",
    content: description,
  });

  if (messageError) {
    redirect(
      `/advogado/${tenantId}?error=${encodeURIComponent(messageError.message)}`,
    );
  }

  redirect(`/acompanhar/${publicToken}/sucesso`);
}