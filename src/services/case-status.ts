"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createAuditLog } from "@/src/services/audit-logs";

type CaseStatus = "new" | "in_progress" | "waiting_client" | "closed" | "resolved";

function getString(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function isValidCaseStatus(status: string): status is CaseStatus {
  return (
    status === "new" ||
    status === "in_progress" ||
    status === "waiting_client" ||
    status === "closed" ||
    status === "resolved"
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: "Novo",
    in_progress: "Em andamento",
    waiting_client: "Aguardando cliente",
    closed: "Finalizado",
    resolved: "Resolvido",
  };

  return labels[status] ?? status;
}

export async function updateCaseStatusAction(
  formData: FormData,
): Promise<void> {
  const context = await requireUserContext();

  if (
    (context.role !== "lawyer" && context.role !== "master") ||
    !context.tenant
  ) {
    redirect("/dashboard");
  }

  const caseId = getString(formData, "caseId");
  const statusRaw = getString(formData, "status");
  const returnTo = getString(formData, "returnTo");

  if (!caseId || !isValidCaseStatus(statusRaw)) {
    redirect("/dashboard/cases");
  }

  const status = statusRaw;
  const supabase = await createSupabaseServerClient();

  const { data: legalCase, error: caseReadError } = await supabase
    .from("cases")
    .select("id, tenant_id, title, status")
    .eq("id", caseId)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (caseReadError || !legalCase) {
    redirect("/dashboard/cases");
  }

  const previousStatus = legalCase.status;

  const { error } = await supabase
    .from("cases")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId)
    .eq("tenant_id", context.tenant.id);

  if (error) {
    redirect(
      `/dashboard/cases/${caseId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  await createAuditLog({
    tenantId: context.tenant.id,
    actorId: context.user.id,
    action: "case_status_updated",
    entityType: "case",
    entityId: caseId,
    description: `Status do caso "${legalCase.title}" alterado de "${getStatusLabel(
      previousStatus,
    )}" para "${getStatusLabel(status)}".`,
    metadata: {
      previous_status: previousStatus,
      new_status: status,
    },
  });

  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard/cases");
  revalidatePath("/dashboard/cases/kanban");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/audit");

  if (returnTo === "kanban") {
    redirect("/dashboard/cases/kanban");
  }

  if (returnTo === "list") {
    redirect("/dashboard/cases");
  }

  redirect(`/dashboard/cases/${caseId}`);
}