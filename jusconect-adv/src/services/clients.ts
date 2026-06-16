import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { requireUserContext } from "@/src/lib/auth/get-user-context";
import type { Database } from "@/src/types/supabase";

type ClientType = Database["public"]["Enums"]["client_type"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export async function listClients(): Promise<ClientRow[]> {
  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parseClientType(value: string): ClientType {
  if (value === "PJ") {
    return "PJ";
  }

  return "PF";
}

export async function createClientAction(formData: FormData): Promise<void> {
  "use server";

  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
    redirect("/dashboard");
  }

  const name = getStringField(formData, "name");
  const document = getStringField(formData, "document");
  const email = getStringField(formData, "email");
  const phone = getStringField(formData, "phone");
  const type = parseClientType(getStringField(formData, "type"));

  if (!name) {
    redirect("/dashboard/clients/new?error=Informe o nome do cliente.");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("clients").insert({
    tenant_id: context.tenant.id,
    user_id: context.user.id,
    type,
    name,
    document: document || null,
    email: email || null,
    phone: phone || null,
  });

  if (error) {
    redirect(`/dashboard/clients/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}