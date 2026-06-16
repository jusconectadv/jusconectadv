"use server";

import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/supabase";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type CaseDocumentRow =
  Database["public"]["Tables"]["case_documents"]["Row"];
type CaseNoteRow = Database["public"]["Tables"]["case_notes"]["Row"];
type CaseTaskRow = Database["public"]["Tables"]["case_tasks"]["Row"];

export type CaseTimelineEventType =
  | "case_created"
  | "message"
  | "document"
  | "note"
  | "task_created"
  | "task_done"
  | "task_pending";

export type CaseTimelineEventVisibility = "public" | "internal";

export type CaseTimelineEvent = {
  id: string;
  type: CaseTimelineEventType;
  visibility: CaseTimelineEventVisibility;
  title: string;
  description: string;
  created_at: string;
  sender_type: string | null;
  href: string | null;
};

export type CaseTimelineResult = {
  legal_case: CaseRow;
  client: ClientRow;
  events: CaseTimelineEvent[];
  summary: {
    total_events: number;
    public_events: number;
    internal_events: number;
    messages: number;
    documents: number;
    notes: number;
    tasks: number;
  };
};

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

function isAllowedTenantMemberRole(role: string): boolean {
  return role === "owner" || role === "staff";
}

function getMessageTitle(senderType: string): string {
  if (senderType === "client") {
    return "Mensagem enviada pelo cliente";
  }

  if (senderType === "lawyer") {
    return "Mensagem enviada pelo escritório";
  }

  if (senderType === "ia") {
    return "Mensagem gerada pela IA";
  }

  return "Mensagem registrada";
}

function getDocumentTitle(senderType: string): string {
  if (senderType === "client") {
    return "Documento enviado pelo cliente";
  }

  if (senderType === "lawyer") {
    return "Documento enviado pelo escritório";
  }

  if (senderType === "ia") {
    return "Documento gerado pela IA";
  }

  return "Documento registrado";
}

function getTaskTitle(task: CaseTaskRow): string {
  if (task.status === "done") {
    return "Tarefa concluída";
  }

  return "Tarefa criada ou pendente";
}

function getTaskEventType(task: CaseTaskRow): CaseTimelineEventType {
  if (task.status === "done") {
    return "task_done";
  }

  return "task_pending";
}

function limitText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

async function getAuthorizedTimelineContext(caseId: string): Promise<{
  tenantId: string;
  legalCase: CaseRow;
}> {
  const context = await requireUserContext();

  if (!isAllowedProfileRole(context.role)) {
    redirect("/dashboard");
  }

  if (!context.tenant) {
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

  const { data: legalCase, error: caseError } = await admin
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (caseError || !legalCase) {
    redirect("/dashboard/cases");
  }

  return {
    tenantId: context.tenant.id,
    legalCase,
  };
}

export async function getCaseTimeline(
  caseId: string,
): Promise<CaseTimelineResult> {
  const { tenantId, legalCase } = await getAuthorizedTimelineContext(caseId);
  const admin = createSupabaseAdminClient();

  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("*")
    .eq("id", legalCase.client_id)
    .eq("tenant_id", tenantId)
    .single();

  if (clientError || !client) {
    redirect(`/dashboard/cases/${caseId}`);
  }

  const { data: messages, error: messagesError } = await admin
    .from("messages")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("case_id", legalCase.id)
    .order("created_at", { ascending: false });

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const { data: documents, error: documentsError } = await admin
    .from("case_documents")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("case_id", legalCase.id)
    .order("created_at", { ascending: false });

  if (documentsError) {
    throw new Error(documentsError.message);
  }

  const { data: notes, error: notesError } = await admin
    .from("case_notes")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("case_id", legalCase.id)
    .order("created_at", { ascending: false });

  if (notesError) {
    throw new Error(notesError.message);
  }

  const { data: tasks, error: tasksError } = await admin
    .from("case_tasks")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("case_id", legalCase.id)
    .order("created_at", { ascending: false });

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const safeMessages: MessageRow[] = messages ?? [];
  const safeDocuments: CaseDocumentRow[] = documents ?? [];
  const safeNotes: CaseNoteRow[] = notes ?? [];
  const safeTasks: CaseTaskRow[] = tasks ?? [];

  const caseCreatedEvent: CaseTimelineEvent = {
    id: `case-created-${legalCase.id}`,
    type: "case_created",
    visibility: "public",
    title: "Caso criado",
    description: legalCase.description ?? "Caso criado sem descrição inicial.",
    created_at: legalCase.created_at,
    sender_type: null,
    href: `/dashboard/cases/${legalCase.id}`,
  };

  const messageEvents: CaseTimelineEvent[] = safeMessages.map((message) => ({
    id: `message-${message.id}`,
    type: "message",
    visibility: "public",
    title: getMessageTitle(message.sender_type),
    description: limitText(message.content, 800),
    created_at: message.created_at,
    sender_type: message.sender_type,
    href: `/dashboard/cases/${legalCase.id}`,
  }));

  const documentEvents: CaseTimelineEvent[] = safeDocuments.map((document) => ({
    id: `document-${document.id}`,
    type: "document",
    visibility: "public",
    title: getDocumentTitle(document.sender_type),
    description: document.file_name,
    created_at: document.created_at,
    sender_type: document.sender_type,
    href: `/dashboard/cases/${legalCase.id}`,
  }));

  const noteEvents: CaseTimelineEvent[] = safeNotes.map((note) => ({
    id: `note-${note.id}`,
    type: "note",
    visibility: "internal",
    title: "Nota interna registrada",
    description: limitText(note.content, 800),
    created_at: note.created_at,
    sender_type: "internal",
    href: `/dashboard/cases/${legalCase.id}`,
  }));

  const taskEvents: CaseTimelineEvent[] = safeTasks.map((task) => ({
    id: `task-${task.id}`,
    type: getTaskEventType(task),
    visibility: "internal",
    title: getTaskTitle(task),
    description: task.description
      ? `${task.title}\n\n${task.description}`
      : task.title,
    created_at: task.updated_at ?? task.created_at,
    sender_type: "internal",
    href: `/dashboard/cases/${legalCase.id}`,
  }));

  const events: CaseTimelineEvent[] = [
    caseCreatedEvent,
    ...messageEvents,
    ...documentEvents,
    ...noteEvents,
    ...taskEvents,
  ].sort(
    (first, second) =>
      new Date(second.created_at).getTime() -
      new Date(first.created_at).getTime(),
  );

  return {
    legal_case: legalCase,
    client,
    events,
    summary: {
      total_events: events.length,
      public_events: events.filter((event) => event.visibility === "public")
        .length,
      internal_events: events.filter((event) => event.visibility === "internal")
        .length,
      messages: safeMessages.length,
      documents: safeDocuments.length,
      notes: safeNotes.length,
      tasks: safeTasks.length,
    },
  };
}