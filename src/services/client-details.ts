"use server";

import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type CaseDocumentRow =
  Database["public"]["Tables"]["case_documents"]["Row"];

export type ClientDetailsCase = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
};

export type ClientDetailsMessage = {
  id: string;
  case_id: string;
  case_title: string;
  sender_type: string;
  content: string;
  created_at: string;
};

export type ClientDetailsDocument = {
  id: string;
  case_id: string;
  case_title: string;
  sender_type: string;
  file_name: string;
  created_at: string;
};

export type ClientDetailsSummary = {
  total_cases: number;
  new_cases: number;
  in_progress_cases: number;
  waiting_client_cases: number;
  closed_cases: number;
  total_messages: number;
  total_documents: number;
};

export type ClientDetailsResult = {
  client: ClientRow;
  summary: ClientDetailsSummary;
  cases: ClientDetailsCase[];
  recent_messages: ClientDetailsMessage[];
  recent_documents: ClientDetailsDocument[];
};

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

function isClosedCase(status: string): boolean {
  return status === "closed" || status === "resolved";
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function sortByCreatedAtDesc<TItem extends { created_at: string }>(
  first: TItem,
  second: TItem,
): number {
  return (
    new Date(second.created_at).getTime() -
    new Date(first.created_at).getTime()
  );
}

function limitItems<TItem>(
  items: TItem[],
  limit: number,
): TItem[] {
  return items.slice(0, limit);
}

function normalizeDocumentValue(
  value: string | null | undefined,
): string {
  return (value ?? "").trim().toLowerCase();
}

function getDocumentUniqueKey(
  document: CaseDocumentRow,
): string {
  const storagePath = normalizeDocumentValue(
    document.storage_path,
  );

  /*
   * Quando existe caminho no Storage, ele é a melhor referência
   * para identificar o mesmo arquivo.
   */
  if (storagePath) {
    return `storage:${document.tenant_id}:${storagePath}`;
  }

  /*
   * Compatibilidade com registros antigos que podem não possuir
   * storage_path.
   */
  return [
    "fallback",
    document.tenant_id,
    document.case_id,
    normalizeDocumentValue(document.file_name),
    normalizeDocumentValue(document.sender_type),
    normalizeDocumentValue(document.file_type),
    String(document.file_size ?? ""),
  ].join(":");
}

function removeDuplicateDocuments(
  documents: CaseDocumentRow[],
): CaseDocumentRow[] {
  const documentsByKey = new Map<string, CaseDocumentRow>();

  const sortedDocuments = [...documents].sort(
    sortByCreatedAtDesc,
  );

  sortedDocuments.forEach((document) => {
    const key = getDocumentUniqueKey(document);

    /*
     * Como a lista está ordenada do mais recente para o mais antigo,
     * mantemos a primeira ocorrência encontrada.
     */
    if (!documentsByKey.has(key)) {
      documentsByKey.set(key, document);
    }
  });

  return Array.from(documentsByKey.values()).sort(
    sortByCreatedAtDesc,
  );
}

export async function getClientDetails(
  clientId: string,
): Promise<ClientDetailsResult> {
  const context = await requireUserContext();

  if (!isAllowedProfileRole(context.role)) {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (clientError || !client) {
    redirect("/dashboard/clients");
  }

  const { data: casesData, error: casesError } =
    await supabase
      .from("cases")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .eq("client_id", client.id)
      .order("created_at", { ascending: false });

  if (casesError) {
    throw new Error(
      "Não foi possível carregar os casos do cliente.",
    );
  }

  const cases: CaseRow[] = casesData ?? [];

  const caseIds = uniqueStrings(
    cases.map((caseItem) => caseItem.id),
  );

  let messages: MessageRow[] = [];
  let documents: CaseDocumentRow[] = [];

  if (caseIds.length > 0) {
    const {
      data: messagesData,
      error: messagesError,
    } = await supabase
      .from("messages")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .in("case_id", caseIds)
      .order("created_at", { ascending: false })
      .limit(30);

    if (messagesError) {
      throw new Error(
        "Não foi possível carregar as mensagens do cliente.",
      );
    }

    const {
      data: documentsData,
      error: documentsError,
    } = await supabase
      .from("case_documents")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .in("case_id", caseIds)
      .order("created_at", { ascending: false })
      .limit(100);

    if (documentsError) {
      throw new Error(
        "Não foi possível carregar os documentos do cliente.",
      );
    }

    messages = messagesData ?? [];

    documents = removeDuplicateDocuments(
      documentsData ?? [],
    );
  }

  const casesById = new Map<string, CaseRow>();

  cases.forEach((caseItem) => {
    casesById.set(caseItem.id, caseItem);
  });

  const formattedCases: ClientDetailsCase[] = cases.map(
    (caseItem) => ({
      id: caseItem.id,
      title: caseItem.title,
      description: caseItem.description,
      status: caseItem.status,
      priority: caseItem.priority,
      created_at: caseItem.created_at,
    }),
  );

  const recentMessages: ClientDetailsMessage[] =
    limitItems(
      messages
        .map((message) => {
          const relatedCase = casesById.get(
            message.case_id,
          );

          return {
            id: message.id,
            case_id: message.case_id,
            case_title:
              relatedCase?.title ??
              "Caso não encontrado",
            sender_type: message.sender_type,
            content: message.content,
            created_at: message.created_at,
          };
        })
        .sort(sortByCreatedAtDesc),
      10,
    );

  const recentDocuments: ClientDetailsDocument[] =
    limitItems(
      documents
        .map((document) => {
          const relatedCase = casesById.get(
            document.case_id,
          );

          return {
            id: document.id,
            case_id: document.case_id,
            case_title:
              relatedCase?.title ??
              "Caso não encontrado",
            sender_type: document.sender_type,
            file_name: document.file_name,
            created_at: document.created_at,
          };
        })
        .sort(sortByCreatedAtDesc),
      10,
    );

  return {
    client,

    summary: {
      total_cases: cases.length,

      new_cases: cases.filter(
        (caseItem) => caseItem.status === "new",
      ).length,

      in_progress_cases: cases.filter(
        (caseItem) =>
          caseItem.status === "in_progress",
      ).length,

      waiting_client_cases: cases.filter(
        (caseItem) =>
          caseItem.status === "waiting_client",
      ).length,

      closed_cases: cases.filter((caseItem) =>
        isClosedCase(caseItem.status),
      ).length,

      total_messages: messages.length,

      /*
       * O contador agora considera somente documentos únicos.
       */
      total_documents: documents.length,
    },

    cases: formattedCases,
    recent_messages: recentMessages,
    recent_documents: recentDocuments,
  };
}