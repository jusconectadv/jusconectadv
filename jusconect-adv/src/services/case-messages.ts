"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { requireUserContext } from "@/src/lib/auth/get-user-context";
import type { Database } from "@/src/types/supabase";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function listCaseMessages(caseId: string): Promise<MessageRow[]> {
  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("case_id", caseId)
    .eq("tenant_id", context.tenant.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function sendCaseMessageAction(formData: FormData): Promise<void> {
  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
    redirect("/dashboard");
  }

  const caseId = getStringField(formData, "caseId");
  const content = getStringField(formData, "content");

  if (!caseId || !content) {
    redirect(`/dashboard/cases/${caseId}?error=Mensagem inválida.`);
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("messages").insert({
    tenant_id: context.tenant.id,
    case_id: caseId,
    sender_type: "lawyer",
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