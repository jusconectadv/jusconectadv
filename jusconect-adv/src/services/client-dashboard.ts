"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type CaseDocumentRow = Database["public"]["Tables"]["case_documents"]["Row"];

type CasePriority = "low" | "medium" | "high" | "urgent";

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

  const { error: updateError } = await admin
    .from("clients")
    .update({
      auth_user_id: context.user.id,
      updated_at: new Date().toISOString(),
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
      updated_at: new Date().toISOString(),
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

  const { client } = await getLoggedClient();

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
    .select("id, tenant_id, client_id")
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

  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/cases");
  revalidatePath(`/dashboard/client/cases/${createdCase.id}`);

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

  const { client } = await getLoggedClient();

  if (!client) {
    redirect("/dashboard/client");
  }

  const admin = createSupabaseAdminClient();

  const { data: legalCase, error: caseError } = await admin
    .from("cases")
    .select("id, tenant_id, client_id")
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

  revalidatePath(`/dashboard/client/cases/${caseId}`);
  redirect(`/dashboard/client/cases/${caseId}?success=message-sent`);
}

export async function uploadAuthenticatedClientDocumentAction(
  formData: FormData,
): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const file = formData.get("file");

  if (!caseId) {
    redirect("/dashboard/client?error=Caso inválido.");
  }

  if (!(file instanceof File)) {
    redirect(`/dashboard/client/cases/${caseId}?error=Arquivo inválido.`);
  }

  if (file.size === 0) {
    redirect(`/dashboard/client/cases/${caseId}?error=Arquivo vazio.`);
  }

  const maxSizeInBytes = 20 * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    redirect(`/dashboard/client/cases/${caseId}?error=Arquivo maior que 20MB.`);
  }

  const { client } = await getLoggedClient();

  if (!client) {
    redirect("/dashboard/client");
  }

  const admin = createSupabaseAdminClient();

  const { data: legalCase, error: caseError } = await admin
    .from("cases")
    .select("id, tenant_id, client_id")
    .eq("id", caseId)
    .eq("tenant_id", client.tenant_id)
    .eq("client_id", client.id)
    .single();

  if (caseError || !legalCase) {
    redirect("/dashboard/client");
  }

  const fileExtension = getSafeFileExtension(file.name);
  const storageFileName = `${crypto.randomUUID()}.${fileExtension}`;
  const storagePath = `${legalCase.tenant_id}/${legalCase.id}/${storageFileName}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error: uploadError } = await admin.storage
    .from("case-documents")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    redirect(
      `/dashboard/client/cases/${caseId}?error=${encodeURIComponent(
        uploadError.message,
      )}`,
    );
  }

  const { error: insertError } = await admin.from("case_documents").insert({
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
      `/dashboard/client/cases/${caseId}?error=${encodeURIComponent(
        insertError.message,
      )}`,
    );
  }

  revalidatePath(`/dashboard/client/cases/${caseId}`);
  redirect(`/dashboard/client/cases/${caseId}?success=document-uploaded`);
}