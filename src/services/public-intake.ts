"use server";

import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

type ClientType = "PF" | "PJ";
type CasePriority = "low" | "medium" | "high" | "urgent";
type AccountMode = "create" | "login";

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseClientType(value: string): ClientType {
  return value === "PJ" ? "PJ" : "PF";
}

function parsePriority(value: string): CasePriority {
  if (
    value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "urgent"
  ) {
    return value;
  }

  return "medium";
}

function parseAccountMode(value: string): AccountMode {
  return value === "login" ? "login" : "create";
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

function buildPublicFormUrl(params: {
  tenantId: string;
  error?: string;
}): string {
  const baseUrl = `/advogado/${params.tenantId}`;

  if (!params.error) {
    return baseUrl;
  }

  return `${baseUrl}?error=${encodeURIComponent(params.error)}`;
}

async function uploadPublicCaseDocuments(params: {
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

export async function createPublicCaseAction(
  formData: FormData,
): Promise<void> {
  const tenantId = getStringField(formData, "tenantId");
  const name = getStringField(formData, "name");
  const rawEmail = getStringField(formData, "email");
  const email = normalizeEmail(rawEmail);
  const phone = getStringField(formData, "phone");
  const document = getStringField(formData, "document");

  const clientType = parseClientType(
    getStringField(formData, "clientType"),
  );

  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");

  const priority = parsePriority(
    getStringField(formData, "priority"),
  );

  const accountMode = parseAccountMode(
    getStringField(formData, "accountMode"),
  );

  const password = getStringField(formData, "password");
  const confirmPassword = getStringField(
    formData,
    "confirmPassword",
  );

  if (!tenantId) {
    redirect("/login");
  }

  if (!name || !email || !title || !description) {
    redirect(
      buildPublicFormUrl({
        tenantId,
        error:
          "Preencha nome, e-mail e as informações obrigatórias do atendimento.",
      }),
    );
  }

  if (!password) {
    redirect(
      buildPublicFormUrl({
        tenantId,
        error: "Informe sua senha de acesso.",
      }),
    );
  }

  if (password.length < 6) {
    redirect(
      buildPublicFormUrl({
        tenantId,
        error: "A senha deve possuir pelo menos 6 caracteres.",
      }),
    );
  }

  if (accountMode === "create" && password !== confirmPassword) {
    redirect(
      buildPublicFormUrl({
        tenantId,
        error:
          "A confirmação da senha não corresponde à senha informada.",
      }),
    );
  }

  const files = getValidFiles(
    getFilesFromFormData(formData),
  );

  const admin = createSupabaseAdminClient();
  const authClient = await createSupabaseServerClient();

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .select("id, active")
    .eq("id", tenantId)
    .eq("active", true)
    .single();

  if (tenantError || !tenant) {
    redirect(
      buildPublicFormUrl({
        tenantId,
        error: "Escritório não encontrado ou indisponível.",
      }),
    );
  }

  const {
    data: publicSettings,
    error: publicSettingsError,
  } = await admin
    .from("tenant_public_settings")
    .select("is_public_active")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (publicSettingsError) {
    redirect(
      buildPublicFormUrl({
        tenantId,
        error: publicSettingsError.message,
      }),
    );
  }

  if (publicSettings && !publicSettings.is_public_active) {
    redirect(
      buildPublicFormUrl({
        tenantId,
        error: "Atendimento público indisponível.",
      }),
    );
  }

  let userId: string;

  if (accountMode === "login") {
    const { data: loginData, error: loginError } =
      await authClient.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError || !loginData.user) {
      const loginMessage =
        loginError?.message === "Invalid login credentials"
          ? "E-mail ou senha inválidos."
          : loginError?.message ??
            "Não foi possível entrar na conta.";

      redirect(
        buildPublicFormUrl({
          tenantId,
          error: loginMessage,
        }),
      );
    }

    userId = loginData.user.id;
  } else {
    const { data: signUpData, error: signUpError } =
      await authClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

    if (signUpError) {
      const normalizedMessage =
        signUpError.message.toLowerCase();

      const isExistingAccount =
        normalizedMessage.includes("already") ||
        normalizedMessage.includes("registered") ||
        normalizedMessage.includes("exists");

      redirect(
        buildPublicFormUrl({
          tenantId,
          error: isExistingAccount
            ? "Este e-mail já possui uma conta. Selecione “Já tenho uma conta” e informe sua senha."
            : signUpError.message,
        }),
      );
    }

    if (!signUpData.user) {
      redirect(
        buildPublicFormUrl({
          tenantId,
          error: "Não foi possível criar sua conta.",
        }),
      );
    }

    userId = signUpData.user.id;
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: name,
        role: "client",
      },
      {
        onConflict: "id",
      },
    );

  if (profileError) {
    redirect(
      buildPublicFormUrl({
        tenantId,
        error: profileError.message,
      }),
    );
  }

  const {
    data: clientsByAuthId,
    error: clientsByAuthIdError,
  } = await admin
    .from("clients")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("auth_user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (clientsByAuthIdError) {
    redirect(
      buildPublicFormUrl({
        tenantId,
        error: clientsByAuthIdError.message,
      }),
    );
  }

  let client: ClientRow | null =
    clientsByAuthId?.[0] ?? null;

  if (!client) {
    const {
      data: clientsByEmail,
      error: clientsByEmailError,
    } = await admin
      .from("clients")
      .select("*")
      .eq("tenant_id", tenant.id)
      .ilike("email", email)
      .order("created_at", { ascending: true });

    if (clientsByEmailError) {
      redirect(
        buildPublicFormUrl({
          tenantId,
          error: clientsByEmailError.message,
        }),
      );
    }

    const availableClient =
      clientsByEmail?.find(
        (existingClient) =>
          !existingClient.auth_user_id ||
          existingClient.auth_user_id === userId,
      ) ?? null;

    const clientLinkedToAnotherUser =
      (clientsByEmail?.length ?? 0) > 0 &&
      !availableClient;

    if (clientLinkedToAnotherUser) {
      redirect(
        buildPublicFormUrl({
          tenantId,
          error:
            "Já existe um cadastro neste escritório com este e-mail vinculado a outra conta.",
        }),
      );
    }

    client = availableClient;
  }

  if (client) {
    const {
      data: updatedClient,
      error: updateClientError,
    } = await admin
      .from("clients")
      .update({
        user_id: userId,
        auth_user_id: userId,
        type: clientType,
        name,
        document: document || null,
        email,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", client.id)
      .eq("tenant_id", tenant.id)
      .select("*")
      .single();

    if (updateClientError || !updatedClient) {
      redirect(
        buildPublicFormUrl({
          tenantId,
          error:
            updateClientError?.message ??
            "Não foi possível vincular seu cadastro.",
        }),
      );
    }

    client = updatedClient;
  } else {
    const {
      data: createdClient,
      error: createClientError,
    } = await admin
      .from("clients")
      .insert({
        tenant_id: tenant.id,
        user_id: userId,
        auth_user_id: userId,
        type: clientType,
        name,
        document: document || null,
        email,
        phone: phone || null,
      })
      .select("*")
      .single();

    if (createClientError || !createdClient) {
      redirect(
        buildPublicFormUrl({
          tenantId,
          error:
            createClientError?.message ??
            "Não foi possível criar o cliente.",
        }),
      );
    }

    client = createdClient;
  }

  const {
    data: existingMembers,
    error: existingMemberError,
  } = await admin
    .from("tenant_members")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("user_id", userId)
    .limit(1);

  if (existingMemberError) {
    redirect(
      buildPublicFormUrl({
        tenantId,
        error: existingMemberError.message,
      }),
    );
  }

  const existingMember = existingMembers?.[0] ?? null;

  if (existingMember) {
    const { error: updateMemberError } = await admin
      .from("tenant_members")
      .update({
        role: "client",
        is_active: true,
      })
      .eq("id", existingMember.id);

    if (updateMemberError) {
      redirect(
        buildPublicFormUrl({
          tenantId,
          error: updateMemberError.message,
        }),
      );
    }
  } else {
    const { error: createMemberError } = await admin
      .from("tenant_members")
      .insert({
        tenant_id: tenant.id,
        user_id: userId,
        role: "client",
        is_active: true,
      });

    if (createMemberError) {
      redirect(
        buildPublicFormUrl({
          tenantId,
          error: createMemberError.message,
        }),
      );
    }
  }

  const publicToken = crypto.randomUUID();

  const { data: legalCase, error: caseError } = await admin
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
      buildPublicFormUrl({
        tenantId,
        error:
          caseError?.message ??
          "Erro ao criar atendimento.",
      }),
    );
  }

  const { error: messageError } = await admin
    .from("messages")
    .insert({
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
      const uploadedDocuments =
        await uploadPublicCaseDocuments({
          tenantId: tenant.id,
          caseId: legalCase.id,
          files,
        });

      const documentsToInsert = uploadedDocuments.map(
        (uploadedDocument) => ({
          tenant_id: tenant.id,
          case_id: legalCase.id,
          sender_type: "client",
          file_name: uploadedDocument.fileName,
          storage_path: uploadedDocument.storagePath,
          file_size: uploadedDocument.fileSize,
          file_type: uploadedDocument.fileType,
        }),
      );

      const { error: documentsError } = await admin
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
        error instanceof Error
          ? error.message
          : "Erro ao enviar documentos.";

      redirect(
        `/acompanhar/${publicToken}?error=${encodeURIComponent(
          message,
        )}`,
      );
    }
  }

  redirect(`/advogado/${tenant.id}/sucesso`);
}