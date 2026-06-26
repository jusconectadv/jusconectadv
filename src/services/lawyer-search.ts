"use server";

import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type CaseDocumentRow =
  Database["public"]["Tables"]["case_documents"]["Row"];

export type LawyerSearchClientResult = {
  id: string;
  name: string;
  type: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
  href: string;
};

export type LawyerSearchCaseResult = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  client_name: string | null;
  href: string;
};

export type LawyerSearchMessageResult = {
  id: string;
  case_id: string;
  case_title: string | null;
  sender_type: string;
  content: string;
  created_at: string;
  href: string;
};

export type LawyerSearchDocumentResult = {
  id: string;
  case_id: string;
  case_title: string | null;
  sender_type: string;
  file_name: string;
  file_type: string | null;
  created_at: string;
  href: string;
};

export type LawyerSearchResult = {
  query: string;
  clients: LawyerSearchClientResult[];
  cases: LawyerSearchCaseResult[];
  messages: LawyerSearchMessageResult[];
  documents: LawyerSearchDocumentResult[];
  total: number;
};

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

function isAllowedTenantMemberRole(role: string): boolean {
  return role === "owner" || role === "staff";
}

function normalizeSearchText(
  value: string | null | undefined,
): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesSearch(
  value: string | null | undefined,
  query: string,
): boolean {
  if (!value) {
    return false;
  }

  return normalizeSearchText(value).includes(query);
}

function clientMatchesSearch(
  client: ClientRow,
  query: string,
): boolean {
  return (
    includesSearch(client.name, query) ||
    includesSearch(client.type, query) ||
    includesSearch(client.document, query) ||
    includesSearch(client.email, query) ||
    includesSearch(client.phone, query)
  );
}

function caseMatchesSearch(
  legalCase: CaseRow,
  query: string,
): boolean {
  return (
    includesSearch(legalCase.title, query) ||
    includesSearch(legalCase.description, query) ||
    includesSearch(legalCase.status, query) ||
    includesSearch(legalCase.priority, query)
  );
}

function messageMatchesSearch(
  message: MessageRow,
  query: string,
): boolean {
  return (
    includesSearch(message.content, query) ||
    includesSearch(message.sender_type, query)
  );
}

function documentMatchesSearch(params: {
  document: CaseDocumentRow;
  legalCase: CaseRow | undefined;
  client: ClientRow | undefined;
  query: string;
}): boolean {
  const {
    document,
    legalCase,
    client,
    query,
  } = params;

  return (
    includesSearch(document.file_name, query) ||
    includesSearch(document.file_type, query) ||
    includesSearch(document.sender_type, query) ||
    includesSearch(legalCase?.title, query) ||
    includesSearch(legalCase?.description, query) ||
    includesSearch(client?.name, query) ||
    includesSearch(client?.document, query) ||
    includesSearch(client?.email, query) ||
    includesSearch(client?.phone, query)
  );
}

function sortByCreatedAtDesc<
  TItem extends {
    created_at: string;
  },
>(
  first: TItem,
  second: TItem,
): number {
  return (
    new Date(second.created_at).getTime() -
    new Date(first.created_at).getTime()
  );
}

function getDocumentUniqueKey(
  document: CaseDocumentRow,
): string {
  const storagePath =
    "storage_path" in document &&
    typeof document.storage_path === "string"
      ? document.storage_path.trim().toLowerCase()
      : "";

  if (storagePath) {
    return `storage:${storagePath}`;
  }

  return [
    document.case_id,
    normalizeSearchText(document.file_name),
    normalizeSearchText(document.file_type),
    normalizeSearchText(document.sender_type),
    "file_size" in document
      ? String(document.file_size ?? "")
      : "",
  ].join(":");
}

function removeDuplicateDocuments(
  documents: CaseDocumentRow[],
): CaseDocumentRow[] {
  const uniqueDocuments =
    new Map<string, CaseDocumentRow>();

  [...documents]
    .sort(sortByCreatedAtDesc)
    .forEach((document) => {
      const key = getDocumentUniqueKey(document);

      if (!uniqueDocuments.has(key)) {
        uniqueDocuments.set(key, document);
      }
    });

  return Array.from(
    uniqueDocuments.values(),
  ).sort(sortByCreatedAtDesc);
}

async function loadDocumentsFromTenantCases(params: {
  tenantId: string;
  cases: CaseRow[];
}): Promise<CaseDocumentRow[]> {
  const { tenantId, cases } = params;

  if (cases.length === 0) {
    return [];
  }

  const admin = createSupabaseAdminClient();

  const caseIds = cases.map(
    (legalCase) => legalCase.id,
  );

  /*
   * Os documentos são localizados pelos casos que já foram
   * validados como pertencentes ao escritório.
   *
   * Isso também permite localizar registros antigos em que o
   * tenant_id do documento não tenha sido preenchido corretamente.
   */
  const { data, error } = await admin
    .from("case_documents")
    .select("*")
    .in("case_id", caseIds)
    .order("created_at", {
      ascending: false,
    })
    .limit(1000);

  if (error) {
    throw new Error(error.message);
  }

  const allowedCaseIds = new Set(caseIds);

  const safeDocuments = (data ?? []).filter(
    (document) =>
      allowedCaseIds.has(document.case_id) &&
      /*
       * Quando o documento possui tenant_id, ele também precisa
       * corresponder ao escritório atual. Registros antigos sem
       * tenant_id continuam protegidos pelo vínculo com o caso.
       */
      (!document.tenant_id ||
        document.tenant_id === tenantId),
  );

  return removeDuplicateDocuments(
    safeDocuments,
  );
}

export async function searchLawyerWorkspace(
  rawQuery: string,
): Promise<LawyerSearchResult> {
  const context = await requireUserContext();

  if (context.role === "client") {
    redirect("/dashboard/client");
  }

  if (
    !isAllowedProfileRole(context.role) ||
    !context.tenant
  ) {
    redirect("/dashboard");
  }

  const admin = createSupabaseAdminClient();

  const {
    data: membership,
    error: membershipError,
  } = await admin
    .from("tenant_members")
    .select("role, is_active")
    .eq("tenant_id", context.tenant.id)
    .eq("user_id", context.user.id)
    .eq("is_active", true)
    .single();

  if (
    membershipError ||
    !membership ||
    !isAllowedTenantMemberRole(
      membership.role,
    )
  ) {
    redirect("/dashboard");
  }

  const query =
    normalizeSearchText(rawQuery);

  if (query.length < 2) {
    return {
      query,
      clients: [],
      cases: [],
      messages: [],
      documents: [],
      total: 0,
    };
  }

  const [
    clientsResponse,
    casesResponse,
    messagesResponse,
  ] = await Promise.all([
    admin
      .from("clients")
      .select("*")
      .eq(
        "tenant_id",
        context.tenant.id,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1000),

    admin
      .from("cases")
      .select("*")
      .eq(
        "tenant_id",
        context.tenant.id,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1000),

    admin
      .from("messages")
      .select("*")
      .eq(
        "tenant_id",
        context.tenant.id,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1000),
  ]);

  if (clientsResponse.error) {
    throw new Error(
      clientsResponse.error.message,
    );
  }

  if (casesResponse.error) {
    throw new Error(
      casesResponse.error.message,
    );
  }

  if (messagesResponse.error) {
    throw new Error(
      messagesResponse.error.message,
    );
  }

  const clients: ClientRow[] =
    clientsResponse.data ?? [];

  const cases: CaseRow[] =
    casesResponse.data ?? [];

  const messages: MessageRow[] =
    messagesResponse.data ?? [];

  const documents =
    await loadDocumentsFromTenantCases({
      tenantId: context.tenant.id,
      cases,
    });

  const clientsById = new Map(
    clients.map((client) => [
      client.id,
      client,
    ]),
  );

  const casesById = new Map(
    cases.map((legalCase) => [
      legalCase.id,
      legalCase,
    ]),
  );

  const clientResults: LawyerSearchClientResult[] =
    clients
      .filter((client) =>
        clientMatchesSearch(
          client,
          query,
        ),
      )
      .slice(0, 20)
      .map((client) => ({
        id: client.id,
        name: client.name,
        type: client.type,
        document: client.document,
        email: client.email,
        phone: client.phone,
        active: client.active,
        href: `/dashboard/clients/${client.id}`,
      }));

  const caseResults: LawyerSearchCaseResult[] =
    cases
      .filter((legalCase) => {
        const client =
          clientsById.get(
            legalCase.client_id,
          );

        return (
          caseMatchesSearch(
            legalCase,
            query,
          ) ||
          includesSearch(
            client?.name,
            query,
          ) ||
          includesSearch(
            client?.document,
            query,
          ) ||
          includesSearch(
            client?.email,
            query,
          ) ||
          includesSearch(
            client?.phone,
            query,
          )
        );
      })
      .slice(0, 20)
      .map((legalCase) => {
        const client =
          clientsById.get(
            legalCase.client_id,
          );

        return {
          id: legalCase.id,
          title: legalCase.title,
          description:
            legalCase.description,
          status: legalCase.status,
          priority:
            legalCase.priority,
          client_name:
            client?.name ?? null,
          href: `/dashboard/cases/${legalCase.id}`,
        };
      });

  const messageResults: LawyerSearchMessageResult[] =
    messages
      .filter((message) => {
        const legalCase =
          casesById.get(
            message.case_id,
          );

        const client = legalCase
          ? clientsById.get(
              legalCase.client_id,
            )
          : undefined;

        return (
          messageMatchesSearch(
            message,
            query,
          ) ||
          includesSearch(
            legalCase?.title,
            query,
          ) ||
          includesSearch(
            client?.name,
            query,
          )
        );
      })
      .slice(0, 20)
      .map((message) => {
        const legalCase =
          casesById.get(
            message.case_id,
          );

        return {
          id: message.id,
          case_id: message.case_id,
          case_title:
            legalCase?.title ?? null,
          sender_type:
            message.sender_type,
          content: message.content,
          created_at:
            message.created_at,
          href: `/dashboard/cases/${message.case_id}`,
        };
      });

  const documentResults: LawyerSearchDocumentResult[] =
    documents
      .filter((document) => {
        const legalCase =
          casesById.get(
            document.case_id,
          );

        const client = legalCase
          ? clientsById.get(
              legalCase.client_id,
            )
          : undefined;

        return documentMatchesSearch({
          document,
          legalCase,
          client,
          query,
        });
      })
      .slice(0, 20)
      .map((document) => {
        const legalCase =
          casesById.get(
            document.case_id,
          );

        return {
          id: document.id,
          case_id: document.case_id,
          case_title:
            legalCase?.title ?? null,
          sender_type:
            document.sender_type,
          file_name:
            document.file_name,
          file_type:
            document.file_type,
          created_at:
            document.created_at,
          href: `/dashboard/cases/${document.case_id}`,
        };
      });

  const total =
    clientResults.length +
    caseResults.length +
    messageResults.length +
    documentResults.length;

  return {
    query,
    clients: clientResults,
    cases: caseResults,
    messages: messageResults,
    documents: documentResults,
    total,
  };
}