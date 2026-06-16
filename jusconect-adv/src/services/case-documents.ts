"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { requireUserContext } from "@/src/lib/auth/get-user-context";

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getSafeFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop() : null;

  if (!extension) {
    return "bin";
  }

  return extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
}

export async function uploadCaseDocumentAction(
  formData: FormData,
): Promise<void> {
  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
    redirect("/dashboard");
  }

  const caseId = getStringField(formData, "caseId");
  const file = formData.get("file");

  if (!caseId) {
    redirect("/dashboard/cases?error=Caso inválido.");
  }

  if (!(file instanceof File)) {
    redirect(`/dashboard/cases/${caseId}?error=Arquivo inválido.`);
  }

  if (file.size === 0) {
    redirect(`/dashboard/cases/${caseId}?error=Arquivo vazio.`);
  }

  const maxSizeInBytes = 20 * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    redirect(`/dashboard/cases/${caseId}?error=Arquivo maior que 20MB.`);
  }

  const supabase = await createSupabaseServerClient();

  const fileExtension = getSafeFileExtension(file.name);
  const storageFileName = `${crypto.randomUUID()}.${fileExtension}`;
  const storagePath = `${context.tenant.id}/${caseId}/${storageFileName}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error: uploadError } = await supabase.storage
    .from("case-documents")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    redirect(
      `/dashboard/cases/${caseId}?error=${encodeURIComponent(
        uploadError.message,
      )}`,
    );
  }

  const { error: insertError } = await supabase
    .from("case_documents")
    .insert({
      tenant_id: context.tenant.id,
      case_id: caseId,
      sender_type: "lawyer",
      file_name: file.name,
      storage_path: storagePath,
      file_size: file.size,
      file_type: file.type || null,
    });

  if (insertError) {
    redirect(
      `/dashboard/cases/${caseId}?error=${encodeURIComponent(
        insertError.message,
      )}`,
    );
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  redirect(`/dashboard/cases/${caseId}`);
}

export async function listCaseDocuments(caseId: string) {
  const context = await requireUserContext();

  if (!context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("case_documents")
    .select("*")
    .eq("case_id", caseId)
    .eq("tenant_id", context.tenant.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCaseDocumentUrl(
  storagePath: string,
): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from("case-documents")
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Erro ao gerar URL.");
  }

  return data.signedUrl;
}