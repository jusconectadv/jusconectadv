"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createAuditLog } from "@/src/services/audit-logs";
import type { Database, Json } from "@/src/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type CaseDocumentRow = Database["public"]["Tables"]["case_documents"]["Row"];

type CasePriority = "low" | "medium" | "high" | "urgent";

type UploadedDocumentPayload = {
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string | null;
};

type LoggedClientResult = {
  context: Awaited<ReturnType<typeof requireUserContext>>;
  client: ClientRow | null;
};

export type ClientDashboardData = {
  client: ClientRow | null;
  cases: CaseRow[];
};

export type AuthenticatedClientDocument = CaseDocumentRow & {
  url: string | null;
};

export type ClientCaseDetailData = {
  client: ClientRow;
  legalCase: CaseRow;
  messages: MessageRow[];
  documents: AuthenticatedClientDocument[];
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

function getValidPriority(priority: string): CasePriority {
  if (
    priority === "low" ||
    priority === "medium" ||
    priority === "high" ||
    priority === "urgent"
  ) {
    return priority;
  }

  return "medium";
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
  const admin = createSupabaseAdminClient();

  const uploadedDocuments: UploadedDocumentPayload[] = [];

  for (const file of params.files) {
    const fileExtension = getSafeFileExtension(file.name);
    const storageFileName = `${crypto.randomUUID()}.${fileExtension}`;
    const storagePath = `${params.tenantId}/${params.caseId}/${storageFileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await admin.storage
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

async function getLoggedClient(): Promise<LoggedClientResult> {
  const context = await requireUserContext();

  if (context.role !== "client") {
    redirect("/dashboard");
  }

  const admin = createSupabaseAdminClient();

  const { data: clientByAuthId, error: authClientError } = await admin
    .from("clients")
    .select("*")
    .eq("auth_user_id", context.user.id)
    .maybeSingle();

  if (authClientError) {
    throw new Error(authClientError.message);
  }

  if (clientByAuthId) {
    return {
      context,
      client: clientByAuthId,
    };
  }

  const email = context.user.email;

  if (!email) {
    return {
      context,
      client: null,
    };
  }

  const { data: clientByEmail, error: emailClientError } = await admin
    .from("clients")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  if (emailClientError) {
    throw new Error(emailClientError.message);
  }

  if (!clientByEmail) {
    return {
      context,
      client: null,
    };
  }

  const updatedAt = new Date().toISOString();

  const { error: updateError } = await admin
    .from("clients")
    .update({
      auth_user_id: context.user.id,
      updated_at: updatedAt,
    })
    .eq("id", clientByEmail.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    context,
    client: {
      ...clientByEmail,
      auth_user_id: context.user.id,
      updated_at: updatedAt,
    },
  };
}

export async function getClientDashboardData(): Promise<ClientDashboardData> {
  const { client } = await getLoggedClient();

  if (!client) {
    return {
      client: null,
      cases: [],
    };
  }

  const admin = createSupabaseAdminClient();

  const { data: cases, error } = await admin
    .from("cases")
    .select("*")
    .eq("tenant_id", client.tenant_id)
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return {
    client,
    cases: cases ?? [],
  };
}

export async function getClientCaseDetailData(
  caseId: string,
): Promise<ClientCaseDetailData> {
  const { client } = await getLoggedClient();

  if (!client) {
    redirect("/dashboard/client");
  }

  const admin = createSupabaseAdminClient();

  const { data: legalCase, error: caseError } = await admin
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .eq("tenant_id", client.tenant_id)
    .eq("client_id", client.id)
    .single();

  if (caseError || !legalCase) {
    redirect("/dashboard/client");
  }

  const { data: messages, error: messagesError } = await admin
    .from("messages")
    .select("*")
    .eq("tenant_id", legalCase.tenant_id)
    .eq("case_id", legalCase.id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const { data: documents, error: documentsError } = await admin
    .from("case_documents")
    .select("*")
    .eq("tenant_id", legalCase.tenant_id)
    .eq("case_id", legalCase.id)
    .order("created_at", { ascending: false });

  if (documentsError) {
    throw new Error(documentsError.message);
  }

  const documentsWithUrls: AuthenticatedClientDocument[] = await Promise.all(
    (documents ?? []).map(async (document) => {
      if (!document.storage_path) {
        return {
          ...document,
          url: null,
        };
      }

      const { data, error } = await admin.storage
        .from("case-documents")
        .createSignedUrl(document.storage_path, 60 * 60);

      return {
        ...document,
        url: error ? null : data?.signedUrl ?? null,
      };
    }),
  );

  return {
    client,
    legalCase,
    messages: messages ?? [],
    documents: documentsWithUrls,
  };
}

export async function createAuthenticatedClientCaseAction(
  formData: FormData,
): Promise<void> {
  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const priority = getValidPriority(getStringField(formData, "priority"));

  if (!title || !description) {
    redirect(
      `/dashboard/client/cases/new?error=${encodeURIComponent(
        "Título e descrição são obrigatórios.",
      )}`,
    );
  }

  const { context, client } = await getLoggedClient();

  if (!client) {
    redirect("/dashboard/client");
  }

  const admin = createSupabaseAdminClient();
  const publicToken = crypto.randomUUID();

  const { data: createdCase, error: createCaseError } = await admin
    .from("cases")
    .insert({
      tenant_id: client.tenant_id,
      client_id: client.id,
      title,
      description,
      priority,
      status: "new",
      public_token: publicToken,
      summary_ai: null,
    })
    .select("id, tenant_id, client_id, title, priority")
    .single();

  if (createCaseError || !createdCase) {
    redirect(
      `/dashboard/client/cases/new?error=${encodeURIComponent(
        createCaseError?.message ?? "Erro ao criar atendimento.",
      )}`,
    );
  }

  const { error: messageError } = await admin.from("messages").insert({
    tenant_id: createdCase.tenant_id,
    case_id: createdCase.id,
    sender_type: "client",
    content: description,
  });

  if (messageError) {
    redirect(
      `/dashboard/client/cases/${createdCase.id}?error=${encodeURIComponent(
        messageError.message,
      )}`,
    );
  }

  const caseMetadata: Json = {
    case_title: createdCase.title,
    client_id: client.id,
    client_name: client.name,
    priority: createdCase.priority,
    source: "authenticated_client_dashboard",
  };

  await createAuditLog({
    tenantId: createdCase.tenant_id,
    actorId: context.user.id,
    action: "case_created",
    entityType: "case",
    entityId: createdCase.id,
    description: `Caso "${createdCase.title}" criado pelo cliente logado.`,
    metadata: caseMetadata,
  });

  const messageMetadata: Json = {
    case_title: createdCase.title,
    sender_type: "client",
    source: "authenticated_client_dashboard",
    content_preview: description.slice(0, 160),
  };

  await createAuditLog({
    tenantId: createdCase.tenant_id,
    actorId: context.user.id,
    action: "message_sent",
    entityType: "case",
    entityId: createdCase.id,
    description: `Mensagem inicial enviada pelo cliente no caso "${createdCase.title}".`,
    metadata: messageMetadata,
  });

  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/cases");
  revalidatePath(`/dashboard/client/cases/${createdCase.id}`);
  revalidatePath(`/dashboard/cases/${createdCase.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/audit");

  redirect(`/dashboard/client/cases/${createdCase.id}?success=case-created`);
}

export async function sendAuthenticatedClientMessageAction(
  formData: FormData,
): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const content = getStringField(formData, "content");

  if (!caseId || !content) {
    redirect("/dashboard/client?error=Mensagem inválida.");
  }

  const { context, client } = await getLoggedClient();

  if (!client) {
    redirect("/dashboard/client");
  }

  const admin = createSupabaseAdminClient();

  const { data: legalCase, error: caseError } = await admin
    .from("cases")
    .select("id, tenant_id, client_id, title")
    .eq("id", caseId)
    .eq("tenant_id", client.tenant_id)
    .eq("client_id", client.id)
    .single();

  if (caseError || !legalCase) {
    redirect("/dashboard/client");
  }

  const { error } = await admin.from("messages").insert({
    tenant_id: legalCase.tenant_id,
    case_id: legalCase.id,
    sender_type: "client",
    content,
  });

  if (error) {
    redirect(
      `/dashboard/client/cases/${caseId}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  const metadata: Json = {
    case_title: legalCase.title,
    sender_type: "client",
    source: "authenticated_client_dashboard",
    content_preview: content.slice(0, 160),
  };

  await createAuditLog({
    tenantId: legalCase.tenant_id,
    actorId: context.user.id,
    action: "message_sent",
    entityType: "case",
    entityId: legalCase.id,
    description: `Mensagem enviada pelo cliente no caso "${legalCase.title}".`,
    metadata,
  });

  revalidatePath(`/dashboard/client/cases/${caseId}`);
  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/audit");

  redirect(`/dashboard/client/cases/${caseId}?success=message-sent`);
}

export async function uploadAuthenticatedClientDocumentAction(
  formData: FormData,
): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const files = getValidFiles(getFilesFromFormData(formData));

  if (!caseId) {
    redirect("/dashboard/client?error=Caso inválido.");
  }

  if (files.length === 0) {
    redirect(
      `/dashboard/client/cases/${caseId}?error=${encodeURIComponent(
        "Selecione ao menos um arquivo válido. Máximo de 10 arquivos, até 20MB cada.",
      )}`,
    );
  }

  const { context, client } = await getLoggedClient();

  if (!client) {
    redirect("/dashboard/client");
  }

  const admin = createSupabaseAdminClient();

  const { data: legalCase, error: caseError } = await admin
    .from("cases")
    .select("id, tenant_id, client_id, title")
    .eq("id", caseId)
    .eq("tenant_id", client.tenant_id)
    .eq("client_id", client.id)
    .single();

  if (caseError || !legalCase) {
    redirect("/dashboard/client");
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
      error instanceof Error ? error.message : "Erro ao enviar documentos.";

    redirect(
      `/dashboard/client/cases/${caseId}?error=${encodeURIComponent(message)}`,
    );
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

  const { error: insertError } = await admin
    .from("case_documents")
    .insert(documentsToInsert);

  if (insertError) {
    redirect(
      `/dashboard/client/cases/${caseId}?error=${encodeURIComponent(
        insertError.message,
      )}`,
    );
  }

  for (const uploadedDocument of uploadedDocuments) {
    const metadata: Json = {
      case_title: legalCase.title,
      sender_type: "client",
      source: "authenticated_client_dashboard",
      file_name: uploadedDocument.fileName,
      file_size: uploadedDocument.fileSize,
      file_type: uploadedDocument.fileType,
      storage_path: uploadedDocument.storagePath,
    };

    await createAuditLog({
      tenantId: legalCase.tenant_id,
      actorId: context.user.id,
      action: "document_uploaded",
      entityType: "case",
      entityId: legalCase.id,
      description: `Documento "${uploadedDocument.fileName}" enviado pelo cliente no caso "${legalCase.title}".`,
      metadata,
    });
  }

  revalidatePath(`/dashboard/client/cases/${caseId}`);
  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/audit");

  redirect(`/dashboard/client/cases/${caseId}?success=document-uploaded`);
}