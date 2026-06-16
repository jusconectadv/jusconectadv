"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createAuditLog } from "@/src/services/audit-logs";
import type { Database, Json } from "@/src/types/supabase";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

type CasePriority = "low" | "medium" | "high" | "urgent";

type CaseChange = {
  field: string;
  before: string | null;
  after: string | null;
};

export type EditableCaseResult = {
  legal_case: CaseRow;
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

function getValidPriority(priority: string): CasePriority {
  if (
    priority === "low" ||
    priority === "medium" ||
    priority === "high" ||
    priority === "urgent"
  ) {
    return priority;
  }

  return "medium";
}

function buildCaseChanges(
  currentCase: CaseRow,
  nextCase: {
    title: string;
    description: string;
    priority: CasePriority;
  },
): CaseChange[] {
  const changes: CaseChange[] = [];

  if (currentCase.title !== nextCase.title) {
    changes.push({
      field: "title",
      before: currentCase.title,
      after: nextCase.title,
    });
  }

  if (currentCase.description !== nextCase.description) {
    changes.push({
      field: "description",
      before: currentCase.description,
      after: nextCase.description,
    });
  }

  if (currentCase.priority !== nextCase.priority) {
    changes.push({
      field: "priority",
      before: currentCase.priority,
      after: nextCase.priority,
    });
  }

  return changes;
}

async function getAuthorizedCase(caseId: string): Promise<{
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

export async function getEditableCase(
  caseId: string,
): Promise<EditableCaseResult> {
  const { tenantId, legalCase } = await getAuthorizedCase(caseId);
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

  return {
    legal_case: legalCase,
    client,
  };
}

export async function updateCaseDetailsAction(
  formData: FormData,
): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const priority = getValidPriority(getStringField(formData, "priority"));

  if (!caseId) {
    redirect("/dashboard/cases");
  }

  if (!title || !description) {
    redirect(
      `/dashboard/cases/${caseId}/edit?error=${encodeURIComponent(
        "Título e descrição são obrigatórios.",
      )}`,
    );
  }

  const { userId, tenantId, legalCase } = await getAuthorizedCase(caseId);
  const admin = createSupabaseAdminClient();

  const changes = buildCaseChanges(legalCase, {
    title,
    description,
    priority,
  });

  const { error } = await admin
    .from("cases")
    .update({
      title,
      description,
      priority,
      updated_at: new Date().toISOString(),
    })
    .eq("id", legalCase.id)
    .eq("tenant_id", tenantId);

  if (error) {
    redirect(
      `/dashboard/cases/${caseId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  if (changes.length > 0) {
    const metadata: Json = {
      case_title: title,
      changes,
    };

    await createAuditLog({
      tenantId,
      actorId: userId,
      action: "case_updated",
      entityType: "case",
      entityId: legalCase.id,
      description: `Caso "${title}" atualizado.`,
      metadata,
    });
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath(`/dashboard/cases/${caseId}/edit`);
  revalidatePath("/dashboard/cases");
  revalidatePath("/dashboard/cases/kanban");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/search");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/audit");

  redirect(`/dashboard/cases/${caseId}?success=case-updated`);
}