"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/supabase";

type DocumentTemplateRow =
  Database["public"]["Tables"]["document_templates"]["Row"];

type TemplateCategory =
  | "contract"
  | "power_of_attorney"
  | "declaration"
  | "checklist"
  | "message"
  | "petition"
  | "other";

export type DocumentTemplatesResult = {
  templates: DocumentTemplateRow[];
};

export type DocumentTemplateDetailResult = {
  template: DocumentTemplateRow;
};

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getBooleanField(formData: FormData, field: string): boolean {
  return formData.get(field) === "on";
}

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

function isAllowedTenantMemberRole(role: string): boolean {
  return role === "owner" || role === "staff";
}

function getValidCategory(category: string): TemplateCategory {
  if (
    category === "contract" ||
    category === "power_of_attorney" ||
    category === "declaration" ||
    category === "checklist" ||
    category === "message" ||
    category === "petition" ||
    category === "other"
  ) {
    return category;
  }

  return "other";
}

async function getAuthorizedTemplateContext(): Promise<{
  userId: string;
  tenantId: string;
}> {
  const context = await requireUserContext();

  if (!isAllowedProfileRole(context.role)) {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard");
  }

  const admin = createSupabaseAdminClient();

  const { data: membership, error } = await admin
    .from("tenant_members")
    .select("role, is_active")
    .eq("tenant_id", context.tenant.id)
    .eq("user_id", context.user.id)
    .eq("is_active", true)
    .single();

  if (error || !membership || !isAllowedTenantMemberRole(membership.role)) {
    redirect("/dashboard");
  }

  return {
    userId: context.user.id,
    tenantId: context.tenant.id,
  };
}

export async function listDocumentTemplates(): Promise<DocumentTemplatesResult> {
  const { tenantId } = await getAuthorizedTemplateContext();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("document_templates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return {
    templates: data ?? [],
  };
}

export async function getDocumentTemplateById(
  templateId: string,
): Promise<DocumentTemplateDetailResult> {
  const { tenantId } = await getAuthorizedTemplateContext();
  const admin = createSupabaseAdminClient();

  const { data: template, error } = await admin
    .from("document_templates")
    .select("*")
    .eq("id", templateId)
    .eq("tenant_id", tenantId)
    .single();

  if (error || !template) {
    redirect("/dashboard/templates");
  }

  return {
    template,
  };
}

export async function createDocumentTemplateAction(
  formData: FormData,
): Promise<void> {
  const { userId, tenantId } = await getAuthorizedTemplateContext();

  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const category = getValidCategory(getStringField(formData, "category"));
  const content = getStringField(formData, "content");
  const isActive = getBooleanField(formData, "isActive");

  if (!title || !content) {
    redirect(
      `/dashboard/templates?error=${encodeURIComponent(
        "Título e conteúdo são obrigatórios.",
      )}`,
    );
  }

  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("document_templates").insert({
    tenant_id: tenantId,
    title,
    description: description || null,
    category,
    content,
    is_active: isActive,
    created_by: userId,
    updated_at: null,
  });

  if (error) {
    redirect(`/dashboard/templates?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/templates");
  redirect("/dashboard/templates?success=template-created");
}

export async function updateDocumentTemplateAction(
  formData: FormData,
): Promise<void> {
  const { tenantId } = await getAuthorizedTemplateContext();

  const templateId = getStringField(formData, "templateId");
  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const category = getValidCategory(getStringField(formData, "category"));
  const content = getStringField(formData, "content");
  const isActive = getBooleanField(formData, "isActive");

  if (!templateId) {
    redirect("/dashboard/templates?error=Template inválido.");
  }

  if (!title || !content) {
    redirect(
      `/dashboard/templates/${templateId}/edit?error=${encodeURIComponent(
        "Título e conteúdo são obrigatórios.",
      )}`,
    );
  }

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("document_templates")
    .update({
      title,
      description: description || null,
      category,
      content,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)
    .eq("tenant_id", tenantId);

  if (error) {
    redirect(
      `/dashboard/templates/${templateId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/templates/${templateId}/edit`);

  redirect("/dashboard/templates?success=template-updated");
}

export async function updateDocumentTemplateStatusAction(
  formData: FormData,
): Promise<void> {
  const { tenantId } = await getAuthorizedTemplateContext();

  const templateId = getStringField(formData, "templateId");
  const nextStatus = getStringField(formData, "nextStatus");

  if (!templateId) {
    redirect("/dashboard/templates?error=Template inválido.");
  }

  const isActive = nextStatus === "active";

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("document_templates")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)
    .eq("tenant_id", tenantId);

  if (error) {
    redirect(`/dashboard/templates?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/templates");

  redirect(
    isActive
      ? "/dashboard/templates?success=template-activated"
      : "/dashboard/templates?success=template-deactivated",
  );
}

export async function deleteDocumentTemplateAction(
  formData: FormData,
): Promise<void> {
  const { tenantId } = await getAuthorizedTemplateContext();

  const templateId = getStringField(formData, "templateId");

  if (!templateId) {
    redirect("/dashboard/templates?error=Template inválido.");
  }

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("document_templates")
    .delete()
    .eq("id", templateId)
    .eq("tenant_id", tenantId);

  if (error) {
    redirect(`/dashboard/templates?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/templates");
  redirect("/dashboard/templates?success=template-deleted");
}