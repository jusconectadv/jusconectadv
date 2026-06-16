"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { createAuditLog } from "@/src/services/audit-logs";
import type { Json } from "@/src/types/supabase";

type UploadedDocumentPayload = {
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string | null;
};

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
  const supabase = await createSupabaseServerClient();
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

export async function uploadCaseDocumentAction(
  formData: FormData,
): Promise<void> {
  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
    redirect("/dashboard");
  }

  const caseId = getStringField(formData, "caseId");
  const files = getValidFiles(getFilesFromFormData(formData));

  if (!caseId) {
    redirect("/dashboard/cases?error=Caso inválido.");
  }

  if (files.length === 0) {
    redirect(`/dashboard/cases/${caseId}?error=Selecione ao menos um arquivo.`);
  }

  const supabase = await createSupabaseServerClient();

  const { data: legalCase, error: caseError } = await supabase
    .from("cases")
    .select("id, title, tenant_id")
    .eq("id", caseId)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (caseError || !legalCase) {
    redirect("/dashboard/cases?error=Caso não encontrado.");
  }

  let uploadedDocuments: UploadedDocumentPayload[];

  try {
    uploadedDocuments = await uploadDocumentsToStorage({
      tenantId: context.tenant.id,
      caseId,
      files,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao enviar documento.";

    redirect(`/dashboard/cases/${caseId}?error=${encodeURIComponent(message)}`);
  }

  const documentsToInsert = uploadedDocuments.map((uploadedDocument) => ({
    tenant_id: context.tenant?.id ?? legalCase.tenant_id,
    case_id: caseId,
    sender_type: "lawyer",
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
      `/dashboard/cases/${caseId}?error=${encodeURIComponent(
        insertError.message,
      )}`,
    );
  }

  for (const uploadedDocument of uploadedDocuments) {
    const metadata: Json = {
      case_title: legalCase.title,
      sender_type: "lawyer",
      file_name: uploadedDocument.fileName,
      file_size: uploadedDocument.fileSize,
      file_type: uploadedDocument.fileType,
      storage_path: uploadedDocument.storagePath,
    };

    await createAuditLog({
      tenantId: context.tenant.id,
      actorId: context.user.id,
      action: "document_uploaded",
      entityType: "case",
      entityId: legalCase.id,
      description: `Documento "${uploadedDocument.fileName}" enviado pelo escritório no caso "${legalCase.title}".`,
      metadata,
    });
  }

  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/audit");

  redirect(`/dashboard/cases/${caseId}?success=document-uploaded`);
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