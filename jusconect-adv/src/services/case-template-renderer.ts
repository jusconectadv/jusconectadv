"use server";

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
    tenantId: context.tenant.id,
    legalCase,
  };
}

export async function getCaseTemplateRendererData(params: {
  caseId: string;
  templateId?: string;
}): Promise<CaseTemplateRendererResult> {
  const { caseId, templateId } = params;

  const { tenantId, legalCase } = await getAuthorizedCaseContext(caseId);
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

  return {
    legal_case: legalCase,
    client,
    tenant,
    templates: safeTemplates,
    selected_template: selectedTemplate,
    rendered_content: selectedTemplate
      ? renderTemplateContent({
          template: selectedTemplate,
          legalCase,
          client,
          tenant,
        })
      : null,
  };
}