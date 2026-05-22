"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

function getString(formData: FormData, field: string): string {
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

export async function sendClientMessageAction(
  formData: FormData,
): Promise<void> {
  const token = getString(formData, "token");
  const content = getString(formData, "content");

  if (!token || !content) {
    redirect(`/acompanhar/${token}?error=Mensagem inválida.`);
  }

  const supabase = createSupabaseAdminClient();

  const { data: legalCase, error: caseError } = await supabase
    .from("cases")
    .select("id, tenant_id")
    .eq("public_token", token)
    .single();

  if (caseError || !legalCase) {
    redirect("/");
  }

  const { error } = await supabase.from("messages").insert({
    tenant_id: legalCase.tenant_id,
    case_id: legalCase.id,
    sender_type: "client",
    content,
  });

  if (error) {
    redirect(`/acompanhar/${token}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/acompanhar/${token}`);
  redirect(`/acompanhar/${token}`);
}

export async function uploadClientDocumentAction(
  formData: FormData,
): Promise<void> {
  const token = getString(formData, "token");
  const file = formData.get("file");

  if (!token) {
    redirect("/");
  }

  if (!(file instanceof File)) {
    redirect(`/acompanhar/${token}?error=Arquivo inválido.`);
  }

  if (file.size === 0) {
    redirect(`/acompanhar/${token}?error=Arquivo vazio.`);
  }

  const maxSizeInBytes = 20 * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    redirect(`/acompanhar/${token}?error=Arquivo maior que 20MB.`);
  }

  const supabase = createSupabaseAdminClient();

  const { data: legalCase, error: caseError } = await supabase
    .from("cases")
    .select("id, tenant_id")
    .eq("public_token", token)
    .single();

  if (caseError || !legalCase) {
    redirect("/");
  }

  const fileExtension = getSafeFileExtension(file.name);
  const storageFileName = `${crypto.randomUUID()}.${fileExtension}`;
  const storagePath = `${legalCase.tenant_id}/${legalCase.id}/${storageFileName}`;

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
      `/acompanhar/${token}?error=${encodeURIComponent(uploadError.message)}`,
    );
  }

  const { error: insertError } = await supabase
    .from("case_documents")
    .insert({
      tenant_id: legalCase.tenant_id,
      case_id: legalCase.id,
      sender_type: "client",
      file_name: file.name,
      storage_path: storagePath,
      file_size: file.size,
      file_type: file.type || null,
    });

  if (insertError) {
    redirect(
      `/acompanhar/${token}?error=${encodeURIComponent(insertError.message)}`,
    );
  }

  revalidatePath(`/acompanhar/${token}`);
  redirect(`/acompanhar/${token}`);
}

export async function getClientPortalDocumentUrl(
  storagePath: string,
): Promise<string> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.storage
    .from("case-documents")
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Erro ao gerar URL do documento.");
  }

  return data.signedUrl;
}