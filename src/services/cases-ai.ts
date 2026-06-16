"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { analyzeCase } from "@/src/services/ai/analyze-case";

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function generateCaseAnalysisAction(
  formData: FormData,
): Promise<void> {
  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
    redirect("/dashboard");
  }

  const caseId = getStringField(formData, "caseId");

  if (!caseId) {
    redirect("/dashboard/cases");
  }

  const supabase = await createSupabaseServerClient();

  const { data: legalCase, error: caseError } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (caseError || !legalCase) {
    redirect("/dashboard/cases?error=Caso não encontrado.");
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", legalCase.client_id)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (clientError || !client) {
    redirect(`/dashboard/cases/${caseId}?error=Cliente não encontrado.`);
  }

  const summary = await analyzeCase({
    legalCase,
    client,
  });

  const { error: updateError } = await supabase
    .from("cases")
    .update({
      summary_ai: summary,
      status: "triage",
    })
    .eq("id", caseId)
    .eq("tenant_id", context.tenant.id);

  if (updateError) {
    redirect(
      `/dashboard/cases/${caseId}?error=${encodeURIComponent(
        updateError.message,
      )}`,
    );
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard/cases");

  redirect(`/dashboard/cases/${caseId}`);
}