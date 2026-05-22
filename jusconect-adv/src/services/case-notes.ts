"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/supabase";

type CaseNoteRow = Database["public"]["Tables"]["case_notes"]["Row"];

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function isAllowedProfileRole(role: string): boolean {
  const allowedRoles = ["master", "lawyer"];

  return allowedRoles.includes(role);
}

function isAllowedTenantMemberRole(role: string): boolean {
  const allowedRoles = ["owner", "staff"];

  return allowedRoles.includes(role);
}

async function getAuthorizedCase(caseId: string) {
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
    context,
    legalCase,
  };
}

export async function getCaseNotes(caseId: string): Promise<CaseNoteRow[]> {
  const { legalCase } = await getAuthorizedCase(caseId);
  const admin = createSupabaseAdminClient();

  const { data: notes, error } = await admin
    .from("case_notes")
    .select("*")
    .eq("tenant_id", legalCase.tenant_id)
    .eq("case_id", legalCase.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return notes ?? [];
}

export async function createCaseNoteAction(formData: FormData): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const content = getStringField(formData, "content");

  if (!caseId || !content) {
    redirect("/dashboard/cases");
  }

  const { context, legalCase } = await getAuthorizedCase(caseId);
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("case_notes").insert({
    tenant_id: legalCase.tenant_id,
    case_id: legalCase.id,
    author_id: context.user.id,
    content,
  });

  if (error) {
    redirect(
      `/dashboard/cases/${caseId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  redirect(`/dashboard/cases/${caseId}`);
}

export async function deleteCaseNoteAction(formData: FormData): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const noteId = getStringField(formData, "noteId");

  if (!caseId || !noteId) {
    redirect("/dashboard/cases");
  }

  const { legalCase } = await getAuthorizedCase(caseId);
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("case_notes")
    .delete()
    .eq("id", noteId)
    .eq("tenant_id", legalCase.tenant_id)
    .eq("case_id", legalCase.id);

  if (error) {
    redirect(
      `/dashboard/cases/${caseId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  redirect(`/dashboard/cases/${caseId}`);
}