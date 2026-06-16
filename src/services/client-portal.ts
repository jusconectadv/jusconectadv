"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createAuditLog } from "@/src/services/audit-logs";
import type { Json } from "@/src/types/supabase";

type UploadedDocumentPayload = {
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string | null;
};

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

function getFilesFromFormData(formData: FormData): File[] {
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File);

  if (files.length > 0) {
    return files;
  }

  const fallbackFile = formData.get("file");

  if (fallbackFile instanceof File) {
    return [fallbackFile];
  }

  return [];
}

function getValidFiles(files: File[]): File[] {
  const maxFiles = 10;
  const maxSizeInBytes = 20 * 1024 * 1024;

  return files
    .filter((file) => file.size > 0)
    .filter((file) => file.size <= maxSizeInBytes)
    .slice(0, maxFiles);
}

async function uploadDocumentsToStorage(params: {
  tenantId: string;
  caseId: string;
  files: File[];
}): Promise<UploadedDocumentPayload[]> {
  const supabase = createSupabaseAdminClient();
  const uploadedDocuments: UploadedDocumentPayload[] = [];

  for (const file of params.files) {
    const fileExtension = getSafeFileExtension(file.name);
    const storageFileName = `${crypto.randomUUID()}.${fileExtension}`;
    const storagePath = `${params.tenantId}/${params.caseId}/${storageFileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabase.storage
      .from("case-documents")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    uploadedDocuments.push({
      fileName: file.name,
      storagePath,
      fileSize: file.size,
      fileType: file.type || null,
    });
  }

  return uploadedDocuments;
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
    .select("id, tenant_id, title")
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

  const metadata: Json = {
    case_title: legalCase.title,
    sender_type: "client",
    source: "public_token_portal",
    content_preview: content.slice(0, 160),
  };

  await createAuditLog({
    tenantId: legalCase.tenant_id,
    actorId: null,
    action: "message_sent",
    entityType: "case",
    entityId: legalCase.id,
    description: `Mensagem enviada pelo cliente no caso "${legalCase.title}".`,
    metadata,
  });

  revalidatePath(`/acompanhar/${token}`);
  revalidatePath(`/dashboard/cases/${legalCase.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/audit");

  redirect(`/acompanhar/${token}?success=message-sent`);
}

export async function uploadClientDocumentAction(
  formData: FormData,
): Promise<void> {
  const token = getString(formData, "token");
  const files = getValidFiles(getFilesFromFormData(formData));

  if (!token) {
    redirect("/");
  }

  if (files.length === 0) {
    redirect(`/acompanhar/${token}?error=Selecione ao menos um arquivo.`);
  }

  const supabase = createSupabaseAdminClient();

  const { data: legalCase, error: caseError } = await supabase
    .from("cases")
    .select("id, tenant_id, title")
    .eq("public_token", token)
    .single();

  if (caseError || !legalCase) {
    redirect("/");
  }

  let uploadedDocuments: UploadedDocumentPayload[];

  try {
    uploadedDocuments = await uploadDocumentsToStorage({
      tenantId: legalCase.tenant_id,
      caseId: legalCase.id,
      files,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao enviar documento.";

    redirect(`/acompanhar/${token}?error=${encodeURIComponent(message)}`);
  }

  const documentsToInsert = uploadedDocuments.map((uploadedDocument) => ({
    tenant_id: legalCase.tenant_id,
    case_id: legalCase.id,
    sender_type: "client",
    file_name: uploadedDocument.fileName,
    storage_path: uploadedDocument.storagePath,
    file_size: uploadedDocument.fileSize,
    file_type: uploadedDocument.fileType,
  }));

  const { error: insertError } = await supabase
    .from("case_documents")
    .insert(documentsToInsert);

  if (insertError) {
    redirect(
      `/acompanhar/${token}?error=${encodeURIComponent(insertError.message)}`,
    );
  }

  for (const uploadedDocument of uploadedDocuments) {
    const metadata: Json = {
      case_title: legalCase.title,
      sender_type: "client",
      source: "public_token_portal",
      file_name: uploadedDocument.fileName,
      file_size: uploadedDocument.fileSize,
      file_type: uploadedDocument.fileType,
      storage_path: uploadedDocument.storagePath,
    };

    await createAuditLog({
      tenantId: legalCase.tenant_id,
      actorId: null,
      action: "document_uploaded",
      entityType: "case",
      entityId: legalCase.id,
      description: `Documento "${uploadedDocument.fileName}" enviado pelo cliente no caso "${legalCase.title}".`,
      metadata,
    });
  }

  revalidatePath(`/acompanhar/${token}`);
  revalidatePath(`/dashboard/cases/${legalCase.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/audit");

  redirect(`/acompanhar/${token}?success=document-uploaded`);
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