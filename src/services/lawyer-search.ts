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

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function includesSearch(value: string | null | undefined, query: string): boolean {
  if (!value) {
    return false;
  }

  return value.toLowerCase().includes(query);
}

function clientMatchesSearch(client: ClientRow, query: string): boolean {
  return (
    includesSearch(client.name, query) ||
    includesSearch(client.type, query) ||
    includesSearch(client.document, query) ||
    includesSearch(client.email, query) ||
    includesSearch(client.phone, query)
  );
}

function caseMatchesSearch(legalCase: CaseRow, query: string): boolean {
  return (
    includesSearch(legalCase.title, query) ||
    includesSearch(legalCase.description, query) ||
    includesSearch(legalCase.status, query) ||
    includesSearch(legalCase.priority, query)
  );
}

function messageMatchesSearch(message: MessageRow, query: string): boolean {
  return (
    includesSearch(message.content, query) ||
    includesSearch(message.sender_type, query)
  );
}

function documentMatchesSearch(
  document: CaseDocumentRow,
  query: string,
): boolean {
  return (
    includesSearch(document.file_name, query) ||
    includesSearch(document.file_type, query) ||
    includesSearch(document.sender_type, query)
  );
}

export async function searchLawyerWorkspace(
  rawQuery: string,
): Promise<LawyerSearchResult> {
  const context = await requireUserContext();

  if (context.role === "client") {
    redirect("/dashboard/client");
  }

  if (!isAllowedProfileRole(context.role) || !context.tenant) {
    redirect("/dashboard");
  }

  const admin = createSupabaseAdminClient();

  const { data: membership, error: membershipError } = await admin
    .from("tenant_members")
    .select("role, is_active")
    .eq("tenant_id", context.tenant.id)
    .eq("user_id", context.user.id)
    .eq("is_active", true)
    .single();

  if (
    membershipError ||
    !membership ||
    !isAllowedTenantMemberRole(membership.role)
  ) {
    redirect("/dashboard");
  }

  const query = normalizeSearchText(rawQuery);

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
    documentsResponse,
  ] = await Promise.all([
    admin
      .from("clients")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .order("created_at", { ascending: false })
      .limit(300),

    admin
      .from("cases")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .order("created_at", { ascending: false })
      .limit(300),

    admin
      .from("messages")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .order("created_at", { ascending: false })
      .limit(300),

    admin
      .from("case_documents")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .order("created_at", { ascending: false })
      .limit(300),
  ]);

  if (clientsResponse.error) {
    throw new Error(clientsResponse.error.message);
  }

  if (casesResponse.error) {
    throw new Error(casesResponse.error.message);
  }

  if (messagesResponse.error) {
    throw new Error(messagesResponse.error.message);
  }

  if (documentsResponse.error) {
    throw new Error(documentsResponse.error.message);
  }

  const clients = clientsResponse.data ?? [];
  const cases = casesResponse.data ?? [];
  const messages = messagesResponse.data ?? [];
  const documents = documentsResponse.data ?? [];

  const clientsById = new Map(clients.map((client) => [client.id, client]));
  const casesById = new Map(cases.map((legalCase) => [legalCase.id, legalCase]));

  const clientResults: LawyerSearchClientResult[] = clients
    .filter((client) => clientMatchesSearch(client, query))
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

  const caseResults: LawyerSearchCaseResult[] = cases
    .filter((legalCase) => {
      const client = clientsById.get(legalCase.client_id);

      return (
        caseMatchesSearch(legalCase, query) ||
        includesSearch(client?.name, query) ||
        includesSearch(client?.document, query) ||
        includesSearch(client?.email, query)
      );
    })
    .slice(0, 20)
    .map((legalCase) => {
      const client = clientsById.get(legalCase.client_id);

      return {
        id: legalCase.id,
        title: legalCase.title,
        description: legalCase.description,
        status: legalCase.status,
        priority: legalCase.priority,
        client_name: client?.name ?? null,
        href: `/dashboard/cases/${legalCase.id}`,
      };
    });

  const messageResults: LawyerSearchMessageResult[] = messages
    .filter((message) => messageMatchesSearch(message, query))
    .slice(0, 20)
    .map((message) => {
      const legalCase = casesById.get(message.case_id);

      return {
        id: message.id,
        case_id: message.case_id,
        case_title: legalCase?.title ?? null,
        sender_type: message.sender_type,
        content: message.content,
        created_at: message.created_at,
        href: `/dashboard/cases/${message.case_id}`,
      };
    });

  const documentResults: LawyerSearchDocumentResult[] = documents
    .filter((document) => documentMatchesSearch(document, query))
    .slice(0, 20)
    .map((document) => {
      const legalCase = casesById.get(document.case_id);

      return {
        id: document.id,
        case_id: document.case_id,
        case_title: legalCase?.title ?? null,
        sender_type: document.sender_type,
        file_name: document.file_name,
        file_type: document.file_type,
        created_at: document.created_at,
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