"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/supabase";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];
type DocumentTemplateRow =
  Database["public"]["Tables"]["document_templates"]["Row"];

export type CaseTemplateRendererResult = {
  legal_case: CaseRow;
  client: ClientRow;
  tenant: TenantRow;
  templates: DocumentTemplateRow[];
  selected_template: DocumentTemplateRow | null;
  rendered_content: string | null;
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

function formatDatePtBr(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function getClientTypeLabel(type: string): string {
  if (type === "PJ") {
    return "Pessoa Jurídica";
  }

  if (type === "PF") {
    return "Pessoa Física";
  }

  return type;
}

function getCaseStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: "Novo",
    in_progress: "Em andamento",
    waiting_client: "Aguardando cliente",
    closed: "Finalizado",
    resolved: "Resolvido",
  };

  return labels[status] ?? status;
}

function getCasePriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
  };

  return labels[priority] ?? priority;
}

function replaceAllVariables(
  content: string,
  variables: Record<string, string>,
): string {
  let renderedContent = content;

  Object.entries(variables).forEach(([key, value]) => {
    renderedContent = renderedContent.split(key).join(value);
  });

  return renderedContent;
}

function renderTemplateContent(params: {
  template: DocumentTemplateRow;
  legalCase: CaseRow;
  client: ClientRow;
  tenant: TenantRow;
}): string {
  const { template, legalCase, client, tenant } = params;

  const variables: Record<string, string> = {
    "{cliente_nome}": client.name,
    "{cliente_tipo}": getClientTypeLabel(client.type),
    "{cliente_documento}": client.document ?? "",
    "{cliente_email}": client.email ?? "",
    "{cliente_telefone}": client.phone ?? "",
    "{caso_titulo}": legalCase.title,
    "{caso_descricao}": legalCase.description ?? "",
    "{caso_status}": getCaseStatusLabel(legalCase.status),
    "{caso_prioridade}": getCasePriorityLabel(legalCase.priority),
    "{data_atual}": formatDatePtBr(new Date()),
    "{tenant_nome}": tenant.name,
  };

  return replaceAllVariables(template.content, variables);
}

async function getAuthorizedCaseContext(caseId: string): Promise<{
  userId: string;
  tenantId: string;
  legalCase: CaseRow;
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

  const { data: legalCase, error: caseError } = await admin
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (caseError || !legalCase) {
    redirect("/dashboard/cases");
  }

  return {
    userId: context.user.id,
    tenantId: context.tenant.id,
    legalCase,
  };
}

async function getTemplateRenderContext(params: {
  caseId: string;
  templateId?: string;
}): Promise<{
  userId: string;
  tenantId: string;
  legalCase: CaseRow;
  client: ClientRow;
  tenant: TenantRow;
  templates: DocumentTemplateRow[];
  selectedTemplate: DocumentTemplateRow | null;
  renderedContent: string | null;
}> {
  const { caseId, templateId } = params;

  const { userId, tenantId, legalCase } =
    await getAuthorizedCaseContext(caseId);

  const admin = createSupabaseAdminClient();

  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("*")
    .eq("id", legalCase.client_id)
    .eq("tenant_id", tenantId)
    .single();

  if (clientError || !client) {
    redirect(`/dashboard/cases/${caseId}`);
  }

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .single();

  if (tenantError || !tenant) {
    redirect(`/dashboard/cases/${caseId}`);
  }

  const { data: templates, error: templatesError } = await admin
    .from("document_templates")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("title", { ascending: true });

  if (templatesError) {
    throw new Error(templatesError.message);
  }

  const safeTemplates = templates ?? [];

  const selectedTemplate =
    templateId && templateId.length > 0
      ? safeTemplates.find((template) => template.id === templateId) ?? null
      : null;

  const renderedContent = selectedTemplate
    ? renderTemplateContent({
        template: selectedTemplate,
        legalCase,
        client,
        tenant,
      })
    : null;

  return {
    userId,
    tenantId,
    legalCase,
    client,
    tenant,
    templates: safeTemplates,
    selectedTemplate,
    renderedContent,
  };
}

export async function getCaseTemplateRendererData(params: {
  caseId: string;
  templateId?: string;
}): Promise<CaseTemplateRendererResult> {
  const data = await getTemplateRenderContext(params);

  return {
    legal_case: data.legalCase,
    client: data.client,
    tenant: data.tenant,
    templates: data.templates,
    selected_template: data.selectedTemplate,
    rendered_content: data.renderedContent,
  };
}

export async function saveGeneratedTemplateAsNoteAction(
  formData: FormData,
): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const templateId = getStringField(formData, "templateId");

  if (!caseId || !templateId) {
    redirect("/dashboard/cases");
  }

  const data = await getTemplateRenderContext({
    caseId,
    templateId,
  });

  if (!data.selectedTemplate || !data.renderedContent) {
    redirect(
      `/dashboard/cases/${caseId}/templates?error=${encodeURIComponent(
        "Selecione um template válido para salvar como nota.",
      )}`,
    );
  }

  const admin = createSupabaseAdminClient();

  const noteContent = [
    `Texto gerado a partir do template: ${data.selectedTemplate.title}`,
    "",
    data.renderedContent,
  ].join("\n");

  const { error } = await admin.from("case_notes").insert({
    tenant_id: data.tenantId,
    case_id: data.legalCase.id,
    author_id: data.userId,
    content: noteContent,
  });

  if (error) {
    redirect(
      `/dashboard/cases/${caseId}/templates?templateId=${templateId}&error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath(`/dashboard/cases/${caseId}/templates`);

  redirect(
    `/dashboard/cases/${caseId}/templates?templateId=${templateId}&success=note-created`,
  );
}

export async function sendGeneratedTemplateAsMessageAction(
  formData: FormData,
): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const templateId = getStringField(formData, "templateId");

  if (!caseId || !templateId) {
    redirect("/dashboard/cases");
  }

  const data = await getTemplateRenderContext({
    caseId,
    templateId,
  });

  if (!data.selectedTemplate || !data.renderedContent) {
    redirect(
      `/dashboard/cases/${caseId}/templates?error=${encodeURIComponent(
        "Selecione um template válido para enviar como mensagem.",
      )}`,
    );
  }

  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("messages").insert({
    tenant_id: data.tenantId,
    case_id: data.legalCase.id,
    sender_type: "lawyer",
    content: data.renderedContent,
  });

  if (error) {
    redirect(
      `/dashboard/cases/${caseId}/templates?templateId=${templateId}&error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath(`/dashboard/cases/${caseId}/templates`);

  if (data.legalCase.public_token) {
    revalidatePath(`/acompanhar/${data.legalCase.public_token}`);
  }

  redirect(
    `/dashboard/cases/${caseId}/templates?templateId=${templateId}&success=message-sent`,
  );
}