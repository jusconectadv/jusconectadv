import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { requireUserContext } from "@/src/lib/auth/get-user-context";
import type { Database } from "@/src/types/supabase";

type CasePriority = "low" | "medium" | "high" | "urgent";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export type CaseListItem = CaseRow & {
  client_name: string | null;
};

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parsePriority(value: string): CasePriority {
  if (value === "high") {
    return "high";
  }

  if (value === "urgent") {
    return "urgent";
  }

  if (value === "low") {
    return "low";
  }

  return "medium";
}

export async function listCases(): Promise<CaseListItem[]> {
  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data: cases, error: casesError } = await supabase
    .from("cases")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .order("created_at", { ascending: false });

  if (casesError) {
    throw new Error(casesError.message);
  }

  const caseRows = cases ?? [];

  if (caseRows.length === 0) {
    return [];
  }

  const clientIds = Array.from(
    new Set(caseRows.map((legalCase) => legalCase.client_id)),
  );

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .in("id", clientIds);

  if (clientsError) {
    throw new Error(clientsError.message);
  }

  const clientsMap = new Map<string, ClientRow>();

  for (const client of clients ?? []) {
    clientsMap.set(client.id, client);
  }

  return caseRows.map((legalCase) => {
    const client = clientsMap.get(legalCase.client_id);

    return {
      ...legalCase,
      client_name: client?.name ?? null,
    };
  });
}

export async function createCaseAction(formData: FormData): Promise<void> {
  "use server";

  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
    redirect("/dashboard");
  }

  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const clientId = getStringField(formData, "clientId");
  const priority = parsePriority(getStringField(formData, "priority"));

  if (!title || !clientId) {
    redirect("/dashboard/cases/new?error=Dados obrigatórios.");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("cases").insert({
    tenant_id: context.tenant.id,
    client_id: clientId,
    title,
    description: description || null,
    priority,
    status: "new",
    summary_ai: null,
    public_token: crypto.randomUUID(),
  });

  if (error) {
    redirect(`/dashboard/cases/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/cases");
  redirect("/dashboard/cases");
}