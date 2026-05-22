"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { requireUserContext } from "@/src/lib/auth/get-user-context";

type CaseStatus = "new" | "in_progress" | "waiting_client" | "closed" | "resolved";

function getString(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function parseCaseStatus(value: string): CaseStatus | null {
  if (value === "new") {
    return "new";
  }

  if (value === "in_progress") {
    return "in_progress";
  }

  if (value === "waiting_client") {
    return "waiting_client";
  }

  if (value === "closed") {
    return "closed";
  }

  if (value === "resolved") {
    return "resolved";
  }

  return null;
}

function getSafeReturnPath(returnTo: string, caseId: string): string {
  if (returnTo === "kanban") {
    return "/dashboard/cases/kanban";
  }

  if (returnTo === "list") {
    return "/dashboard/cases";
  }

  return `/dashboard/cases/${caseId}`;
}

export async function updateCaseStatusAction(
  formData: FormData,
): Promise<void> {
  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
    redirect("/dashboard");
  }

  const caseId = getString(formData, "caseId");
  const status = parseCaseStatus(getString(formData, "status"));
  const returnTo = getString(formData, "returnTo");

  if (!caseId || !status) {
    redirect("/dashboard/cases");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("cases")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId)
    .eq("tenant_id", context.tenant.id);

  const redirectPath = getSafeReturnPath(returnTo, caseId);

  if (error) {
    redirect(`${redirectPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard/cases");
  revalidatePath("/dashboard/cases/kanban");

  redirect(redirectPath);
}