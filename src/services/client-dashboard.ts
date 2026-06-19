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
type CaseDocumentRow =
  Database["public"]["Tables"]["case_documents"]["Row"];

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

export type ClientDashboardMessage = MessageRow & {
  case_title: string;
};

export type ClientDashboardDocument = CaseDocumentRow & {
  case_title: string;
};

export type ClientDashboardData = {
  client: ClientRow | null;
  cases: CaseRow[];
  latestLawyerMessage: ClientDashboardMessage | null;
  latestDocument: ClientDashboardDocument | null;
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

function buildGuidedCaseDescription(params: {
  serviceTitle: string;
  serviceCategory: string;
  situation: string;
  objective: string;
  importantDates: string;
  involvedParties: string;
  availableDocuments: string;
}): string {
  return [
    params.serviceTitle
      ? `TIPO DE ATENDIMENTO\n${params.serviceTitle}`
      : "",
    params.serviceCategory
      ? `CATEGORIA\n${params.serviceCategory}`
      : "",
    params.situation
      ? `O QUE ACONTECEU\n${params.situation}`
      : "",
    params.objective
      ? `O QUE O CLIENTE PRECISA\n${params.objective}`
      : "",
    params.importantDates
      ? `DATAS E PRAZOS IMPORTANTES\n${params.importantDates}`
      : "",
    params.involvedParties
      ? `PESSOAS OU EMPRESAS ENVOLVIDAS\n${params.involvedParties}`
      : "",
    params.availableDocuments
      ? `DOCUMENTOS DISPONÍVEIS\n${params.availableDocuments}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
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
      latestLawyerMessage: null,
      latestDocument: null,
    };
  }

  const admin = createSupabaseAdminClient();

  const { data: cases, error: casesError } = await admin
    .from("cases")
    .select("*")
    .eq("tenant_id", client.tenant_id)
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (casesError) {
    throw new Error(casesError.message);
  }

  const clientCases = cases ?? [];
  const caseIds = clientCases.map((legalCase) => legalCase.id);
  const casesById = new Map(
    clientCases.map((legalCase) => [legalCase.id, legalCase]),
  );

  if (caseIds.length === 0) {
    return {
      client,
      cases: clientCases,
      latestLawyerMessage: null,
      latestDocument: null,
    };
  }

  const { data: latestLawyerMessageRaw, error: messageError } = await admin
    .from("messages")
    .select("*")
    .eq("tenant_id", client.tenant_id)
    .eq("sender_type", "lawyer")
    .in("case_id", caseIds)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (messageError) {
    throw new Error(messageError.message);
  }

  const { data: latestDocumentRaw, error: documentError } = await admin
    .from("case_documents")
    .select("*")
    .eq("tenant_id", client.tenant_id)
    .in("case_id", caseIds)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (documentError) {
    throw new Error(documentError.message);
  }

  const latestLawyerMessage: ClientDashboardMessage | null =
    latestLawyerMessageRaw
      ? {
          ...latestLawyerMessageRaw,
          case_title:
            casesById.get(latestLawyerMessageRaw.case_id)?.title ??
            "Atendimento",
        }
      : null;

  const latestDocument: ClientDashboardDocument | null = latestDocumentRaw
    ? {
        ...latestDocumentRaw,
        case_title:
          casesById.get(latestDocumentRaw.case_id)?.title ??
          "Atendimento",
      }
    : null;

  return {
    client,
    cases: clientCases,
    latestLawyerMessage,
    latestDocument,
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

  const documentsWithUrls: AuthenticatedClientDocument[] =
    await Promise.all(
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
  const priority = getValidPriority(
    getStringField(formData, "priority"),
  );
  const files = getValidFiles(getFilesFromFormData(formData));

  const serviceId = getStringField(formData, "serviceId");
  const serviceTitle = getStringField(formData, "serviceTitle");
  const serviceCategory = getStringField(
    formData,
    "serviceCategory",
  );

  const situation = getStringField(formData, "situation");
  const objective = getStringField(formData, "objective");
  const importantDates = getStringField(
    formData,
    "importantDates",
  );
  const involvedParties = getStringField(
    formData,
    "involvedParties",
  );
  const availableDocuments = getStringField(
    formData,
    "availableDocuments",
  );

  const legacyDescription = getStringField(
    formData,
    "description",
  );

  const guidedDescription = buildGuidedCaseDescription({
    serviceTitle,
    serviceCategory,
    situation,
    objective,
    importantDates,
    involvedParties,
    availableDocuments,
  });

  const description = guidedDescription || legacyDescription;

  const isGuidedForm =
    Boolean(serviceId) ||
    Boolean(serviceTitle) ||
    Boolean(serviceCategory) ||
    Boolean(situation) ||
    Boolean(objective);

  if (!title || !description) {
    const serviceQuery = serviceId
      ? `&service=${encodeURIComponent(serviceId)}`
      : "";

    redirect(
      `/dashboard/client/cases/new?error=${encodeURIComponent(
        "Preencha o título e as informações do atendimento.",
      )}${serviceQuery}`,
    );
  }

  if (isGuidedForm && (!situation || !objective)) {
    const serviceQuery = serviceId
      ? `&service=${encodeURIComponent(serviceId)}`
      : "";

    redirect(
      `/dashboard/client/cases/new?error=${encodeURIComponent(
        "Preencha o que aconteceu e o que você precisa do escritório.",
      )}${serviceQuery}`,
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
    const serviceQuery = serviceId
      ? `&service=${encodeURIComponent(serviceId)}`
      : "";

    redirect(
      `/dashboard/client/cases/new?error=${encodeURIComponent(
        createCaseError?.message ??
          "Erro ao criar atendimento.",
      )}${serviceQuery}`,
    );
  }

  const initialMessageContent =
    situation && objective
      ? [
          serviceTitle
            ? `Atendimento: ${serviceTitle}`
            : "",
          situation
            ? `O que aconteceu:\n${situation}`
            : "",
          objective
            ? `O que preciso:\n${objective}`
            : "",
        ]
          .filter(Boolean)
          .join("\n\n")
      : description;

  const { error: messageError } = await admin
    .from("messages")
    .insert({
      tenant_id: createdCase.tenant_id,
      case_id: createdCase.id,
      sender_type: "client",
      content: initialMessageContent,
    });

  if (messageError) {
    redirect(
      `/dashboard/client/cases/${createdCase.id}?error=${encodeURIComponent(
        messageError.message,
      )}`,
    );
  }

  if (files.length > 0) {
    let uploadedDocuments: UploadedDocumentPayload[];

    try {
      uploadedDocuments = await uploadDocumentsToStorage({
        tenantId: createdCase.tenant_id,
        caseId: createdCase.id,
        files,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "O atendimento foi criado, mas ocorreu um erro ao enviar os arquivos.";

      redirect(
        `/dashboard/client/cases/${createdCase.id}?error=${encodeURIComponent(
          message,
        )}`,
      );
    }

    const documentsToInsert = uploadedDocuments.map(
      (document) => ({
        tenant_id: createdCase.tenant_id,
        case_id: createdCase.id,
        sender_type: "client",
        file_name: document.fileName,
        storage_path: document.storagePath,
        file_size: document.fileSize,
        file_type: document.fileType,
      }),
    );

    const { error: documentsError } = await admin
      .from("case_documents")
      .insert(documentsToInsert);

    if (documentsError) {
      redirect(
        `/dashboard/client/cases/${createdCase.id}?error=${encodeURIComponent(
          documentsError.message,
        )}`,
      );
    }

    for (const document of uploadedDocuments) {
      const documentMetadata: Json = {
        case_title: createdCase.title,
        sender_type: "client",
        source: "authenticated_client_case_creation",
        file_name: document.fileName,
        file_size: document.fileSize,
        file_type: document.fileType,
        storage_path: document.storagePath,
        service_id: serviceId || null,
        service_title: serviceTitle || null,
      };

      await createAuditLog({
        tenantId: createdCase.tenant_id,
        actorId: context.user.id,
        action: "document_uploaded",
        entityType: "case",
        entityId: createdCase.id,
        description: `Documento "${document.fileName}" enviado pelo cliente durante a criação do caso "${createdCase.title}".`,
        metadata: documentMetadata,
      });
    }
  }

  const caseMetadata: Json = {
    case_title: createdCase.title,
    client_id: client.id,
    client_name: client.name,
    priority: createdCase.priority,
    source: "authenticated_client_dashboard",
    service_id: serviceId || null,
    service_title: serviceTitle || null,
    service_category: serviceCategory || null,
    guided_form: isGuidedForm,
    uploaded_documents_count: files.length,
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
    content_preview: initialMessageContent.slice(0, 160),
    service_id: serviceId || null,
    service_title: serviceTitle || null,
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
  revalidatePath("/dashboard/client/cases");
  revalidatePath("/dashboard/cases");
  revalidatePath(
    `/dashboard/client/cases/${createdCase.id}`,
  );
  revalidatePath(`/dashboard/cases/${createdCase.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/audit");

  redirect(
    `/dashboard/client/cases/${createdCase.id}?success=case-created`,
  );
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

  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/client/cases");
  revalidatePath(`/dashboard/client/cases/${caseId}`);
  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/audit");

  redirect(
    `/dashboard/client/cases/${caseId}?success=message-sent`,
  );
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
      error instanceof Error
        ? error.message
        : "Erro ao enviar documentos.";

    redirect(
      `/dashboard/client/cases/${caseId}?error=${encodeURIComponent(
        message,
      )}`,
    );
  }

  const documentsToInsert = uploadedDocuments.map(
    (uploadedDocument) => ({
      tenant_id: legalCase.tenant_id,
      case_id: legalCase.id,
      sender_type: "client",
      file_name: uploadedDocument.fileName,
      storage_path: uploadedDocument.storagePath,
      file_size: uploadedDocument.fileSize,
      file_type: uploadedDocument.fileType,
    }),
  );

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

  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/client/cases");
  revalidatePath(`/dashboard/client/cases/${caseId}`);
  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/audit");

  redirect(
    `/dashboard/client/cases/${caseId}?success=document-uploaded`,
  );
}