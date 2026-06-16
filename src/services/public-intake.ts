"use server";

import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

type ClientType = "PF" | "PJ";
type CasePriority = "low" | "medium" | "high" | "urgent";

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

function parseClientType(value: string): ClientType {
  if (value === "PJ") {
    return "PJ";
  }

  return "PF";
}

function parsePriority(value: string): CasePriority {
  if (value === "urgent") {
    return "urgent";
  }

  if (value === "high") {
    return "high";
  }

  if (value === "low") {
    return "low";
  }

  return "medium";
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

async function uploadPublicCaseDocuments(params: {
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

export async function createPublicCaseAction(
  formData: FormData,
): Promise<void> {
  const tenantId = getStringField(formData, "tenantId");
  const name = getStringField(formData, "name");
  const email = getStringField(formData, "email");
  const phone = getStringField(formData, "phone");
  const document = getStringField(formData, "document");
  const clientType = parseClientType(getStringField(formData, "clientType"));
  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const priority = parsePriority(getStringField(formData, "priority"));

  if (!tenantId) {
    redirect("/login");
  }

  if (!name || !title || !description) {
    redirect(`/advogado/${tenantId}?error=Preencha os campos obrigatórios.`);
  }

  const files = getValidFiles(getFilesFromFormData(formData));

  const supabase = createSupabaseAdminClient();

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, active")
    .eq("id", tenantId)
    .eq("active", true)
    .single();

  if (tenantError || !tenant) {
    redirect(`/advogado/${tenantId}?error=Escritório não encontrado.`);
  }

  const { data: publicSettings, error: publicSettingsError } = await supabase
    .from("tenant_public_settings")
    .select("is_public_active")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (publicSettingsError) {
    redirect(
      `/advogado/${tenantId}?error=${encodeURIComponent(
        publicSettingsError.message,
      )}`,
    );
  }

  if (publicSettings && !publicSettings.is_public_active) {
    redirect(`/advogado/${tenantId}?error=Atendimento público indisponível.`);
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      tenant_id: tenant.id,
      user_id: null,
      auth_user_id: null,
      type: clientType,
      name,
      document: document || null,
      email: email || null,
      phone: phone || null,
    })
    .select("*")
    .single();

  if (clientError || !client) {
    redirect(
      `/advogado/${tenantId}?error=${encodeURIComponent(
        clientError?.message ?? "Erro ao criar cliente.",
      )}`,
    );
  }

  const publicToken = crypto.randomUUID();

  const { data: legalCase, error: caseError } = await supabase
    .from("cases")
    .insert({
      tenant_id: tenant.id,
      client_id: client.id,
      title,
      description,
      priority,
      status: "new",
      summary_ai: null,
      public_token: publicToken,
    })
    .select("*")
    .single();

  if (caseError || !legalCase) {
    redirect(
      `/advogado/${tenantId}?error=${encodeURIComponent(
        caseError?.message ?? "Erro ao criar caso.",
      )}`,
    );
  }

  const { error: messageError } = await supabase.from("messages").insert({
    tenant_id: tenant.id,
    case_id: legalCase.id,
    sender_type: "client",
    content: description,
  });

  if (messageError) {
    redirect(
      `/acompanhar/${publicToken}?error=${encodeURIComponent(
        messageError.message,
      )}`,
    );
  }

  if (files.length > 0) {
    try {
      const uploadedDocuments = await uploadPublicCaseDocuments({
        tenantId: tenant.id,
        caseId: legalCase.id,
        files,
      });

      const documentsToInsert = uploadedDocuments.map((uploadedDocument) => ({
        tenant_id: tenant.id,
        case_id: legalCase.id,
        sender_type: "client",
        file_name: uploadedDocument.fileName,
        storage_path: uploadedDocument.storagePath,
        file_size: uploadedDocument.fileSize,
        file_type: uploadedDocument.fileType,
      }));

      const { error: documentsError } = await supabase
        .from("case_documents")
        .insert(documentsToInsert);

      if (documentsError) {
        redirect(
          `/acompanhar/${publicToken}?error=${encodeURIComponent(
            documentsError.message,
          )}`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao enviar documentos.";

      redirect(
        `/acompanhar/${publicToken}?error=${encodeURIComponent(message)}`,
      );
    }
  }

  redirect(`/acompanhar/${publicToken}/sucesso`);
}
