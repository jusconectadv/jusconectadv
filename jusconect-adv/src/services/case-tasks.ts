"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/supabase";

type CaseTaskRow = Database["public"]["Tables"]["case_tasks"]["Row"];

type CaseTaskPriority = "low" | "medium" | "high" | "urgent";
type CaseTaskStatus = "pending" | "done";
type CaseTaskReturnTo = "case" | "tasks";

type AuthorizedCase = {
  id: string;
  tenant_id: string;
};

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function isAllowedProfileRole(role: string): boolean {
  return role === "master" || role === "lawyer";
}

function isAllowedTenantMemberRole(role: string): boolean {
  return role === "owner" || role === "staff";
}

function getValidPriority(priority: string): CaseTaskPriority {
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

function getValidStatus(status: string): CaseTaskStatus {
  if (status === "done") {
    return "done";
  }

  return "pending";
}

function getValidReturnTo(returnTo: string): CaseTaskReturnTo {
  if (returnTo === "tasks") {
    return "tasks";
  }

  return "case";
}

function getRedirectPath(caseId: string, returnTo: CaseTaskReturnTo): string {
  if (returnTo === "tasks") {
    return "/dashboard/tasks";
  }

  return `/dashboard/cases/${caseId}`;
}

async function getAuthorizedCase(caseId: string): Promise<{
  userId: string;
  legalCase: AuthorizedCase;
}> {
  const context = await requireUserContext();

  if (!isAllowedProfileRole(context.role)) {
    redirect("/dashboard");
  }

  const admin = createSupabaseAdminClient();

  const { data: memberships, error: membershipsError } = await admin
    .from("tenant_members")
    .select("tenant_id, role, is_active")
    .eq("user_id", context.user.id)
    .eq("is_active", true);

  if (membershipsError) {
    throw new Error(membershipsError.message);
  }

  const allowedTenantIds = (memberships ?? [])
    .filter((membership) => isAllowedTenantMemberRole(membership.role))
    .map((membership) => membership.tenant_id);

  if (allowedTenantIds.length === 0) {
    redirect("/dashboard");
  }

  const { data: legalCase, error: caseError } = await admin
    .from("cases")
    .select("id, tenant_id")
    .eq("id", caseId)
    .in("tenant_id", allowedTenantIds)
    .single();

  if (caseError || !legalCase) {
    redirect("/dashboard/cases");
  }

  return {
    userId: context.user.id,
    legalCase,
  };
}

export async function getCaseTasks(caseId: string): Promise<CaseTaskRow[]> {
  const { legalCase } = await getAuthorizedCase(caseId);
  const admin = createSupabaseAdminClient();

  const { data: tasks, error } = await admin
    .from("case_tasks")
    .select("*")
    .eq("tenant_id", legalCase.tenant_id)
    .eq("case_id", legalCase.id)
    .order("status", { ascending: false })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return tasks ?? [];
}

export async function createCaseTaskAction(formData: FormData): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const priority = getValidPriority(getStringField(formData, "priority"));
  const dueDate = getStringField(formData, "dueDate");

  if (!caseId || !title) {
    redirect("/dashboard/cases");
  }

  const { userId, legalCase } = await getAuthorizedCase(caseId);
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("case_tasks").insert({
    tenant_id: legalCase.tenant_id,
    case_id: legalCase.id,
    title,
    description: description || null,
    status: "pending",
    priority,
    due_date: dueDate || null,
    assigned_to: null,
    created_by: userId,
    updated_at: null,
  });

  if (error) {
    redirect(
      `/dashboard/cases/${caseId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard/tasks");

  redirect(`/dashboard/cases/${caseId}`);
}

export async function updateCaseTaskStatusAction(
  formData: FormData,
): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const taskId = getStringField(formData, "taskId");
  const status = getValidStatus(getStringField(formData, "status"));
  const returnTo = getValidReturnTo(getStringField(formData, "returnTo"));

  if (!caseId || !taskId) {
    redirect("/dashboard/cases");
  }

  const { legalCase } = await getAuthorizedCase(caseId);
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("case_tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("tenant_id", legalCase.tenant_id)
    .eq("case_id", legalCase.id);

  if (error) {
    redirect(
      `/dashboard/cases/${caseId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard/tasks");

  redirect(getRedirectPath(caseId, returnTo));
}

export async function deleteCaseTaskAction(formData: FormData): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const taskId = getStringField(formData, "taskId");
  const returnTo = getValidReturnTo(getStringField(formData, "returnTo"));

  if (!caseId || !taskId) {
    redirect("/dashboard/cases");
  }

  const { legalCase } = await getAuthorizedCase(caseId);
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("case_tasks")
    .delete()
    .eq("id", taskId)
    .eq("tenant_id", legalCase.tenant_id)
    .eq("case_id", legalCase.id);

  if (error) {
    redirect(
      `/dashboard/cases/${caseId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard/tasks");

  redirect(getRedirectPath(caseId, returnTo));
}