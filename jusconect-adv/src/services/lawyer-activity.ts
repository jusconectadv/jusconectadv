"use server";

import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/types/supabase";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type CaseDocumentRow = Database["public"]["Tables"]["case_documents"]["Row"];
type CaseTaskRow = Database["public"]["Tables"]["case_tasks"]["Row"];
type CaseNoteRow = Database["public"]["Tables"]["case_notes"]["Row"];

export type LawyerActivityType =
  | "case_created"
  | "message_created"
  | "document_uploaded"
  | "task_created"
  | "note_created";

export type LawyerActivityItem = {
  id: string;
  type: LawyerActivityType;
  title: string;
  description: string;
  created_at: string;
  case_id: string;
  case_title: string;
  client_name: string | null;
  href: string;
};

export type LawyerActivitySummary = {
  total: number;
  cases: number;
  messages: number;
  documents: number;
  tasks: number;
  notes: number;
};

export type LawyerActivityResult = {
  summary: LawyerActivitySummary;
  activities: LawyerActivityItem[];
};

function getClientName(client: ClientRow | undefined): string | null {
  if (!client) {
    return null;
  }

  return client.name ?? null;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function getSenderLabel(senderType: string): string {
  if (senderType === "client") {
    return "Cliente";
  }

  if (senderType === "lawyer") {
    return "Escritório";
  }

  if (senderType === "ia") {
    return "IA";
  }

  return "Sistema";
}

function limitText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function sortActivitiesByDate(
  first: LawyerActivityItem,
  second: LawyerActivityItem,
): number {
  return (
    new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
  );
}

export async function listLawyerActivities(): Promise<LawyerActivityResult> {
  const context = await requireUserContext();

  if (context.role !== "lawyer" && context.role !== "master") {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data: casesData, error: casesError } = await supabase
    .from("cases")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (casesError) {
    throw new Error("Não foi possível carregar os casos recentes.");
  }

  const { data: messagesData, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (messagesError) {
    throw new Error("Não foi possível carregar as mensagens recentes.");
  }

  const { data: documentsData, error: documentsError } = await supabase
    .from("case_documents")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (documentsError) {
    throw new Error("Não foi possível carregar os documentos recentes.");
  }

  const { data: tasksData, error: tasksError } = await supabase
    .from("case_tasks")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (tasksError) {
    throw new Error("Não foi possível carregar as tarefas recentes.");
  }

  const { data: notesData, error: notesError } = await supabase
    .from("case_notes")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (notesError) {
    throw new Error("Não foi possível carregar as notas recentes.");
  }

  const cases: CaseRow[] = casesData ?? [];
  const messages: MessageRow[] = messagesData ?? [];
  const documents: CaseDocumentRow[] = documentsData ?? [];
  const tasks: CaseTaskRow[] = tasksData ?? [];
  const notes: CaseNoteRow[] = notesData ?? [];

  const activityCaseIds = uniqueStrings([
    ...cases.map((caseItem) => caseItem.id),
    ...messages.map((message) => message.case_id),
    ...documents.map((document) => document.case_id),
    ...tasks.map((task) => task.case_id),
    ...notes.map((note) => note.case_id),
  ]);

  let relatedCases: CaseRow[] = cases;

  if (activityCaseIds.length > 0) {
    const { data: relatedCasesData, error: relatedCasesError } = await supabase
      .from("cases")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .in("id", activityCaseIds);

    if (relatedCasesError) {
      throw new Error("Não foi possível carregar os casos relacionados.");
    }

    relatedCases = relatedCasesData ?? [];
  }

  const clientIds = uniqueStrings(
    relatedCases
      .map((caseItem) => caseItem.client_id)
      .filter((clientId) => clientId.length > 0),
  );

  let clients: ClientRow[] = [];

  if (clientIds.length > 0) {
    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .in("id", clientIds);

    if (clientsError) {
      throw new Error("Não foi possível carregar os clientes relacionados.");
    }

    clients = clientsData ?? [];
  }

  const casesById = new Map<string, CaseRow>();
  const clientsById = new Map<string, ClientRow>();

  relatedCases.forEach((caseItem) => {
    casesById.set(caseItem.id, caseItem);
  });

  clients.forEach((client) => {
    clientsById.set(client.id, client);
  });

  const caseActivities: LawyerActivityItem[] = cases.map((caseItem) => {
    const client = clientsById.get(caseItem.client_id);

    return {
      id: `case-${caseItem.id}`,
      type: "case_created",
      title: "Novo caso criado",
      description: caseItem.title,
      created_at: caseItem.created_at,
      case_id: caseItem.id,
      case_title: caseItem.title,
      client_name: getClientName(client),
      href: `/dashboard/cases/${caseItem.id}`,
    };
  });

  const messageActivities: LawyerActivityItem[] = messages.map((message) => {
    const caseItem = casesById.get(message.case_id);
    const client = caseItem ? clientsById.get(caseItem.client_id) : undefined;

    return {
      id: `message-${message.id}`,
      type: "message_created",
      title: `Nova mensagem de ${getSenderLabel(message.sender_type)}`,
      description: limitText(message.content, 140),
      created_at: message.created_at,
      case_id: message.case_id,
      case_title: caseItem?.title ?? "Caso não encontrado",
      client_name: getClientName(client),
      href: `/dashboard/cases/${message.case_id}`,
    };
  });

  const documentActivities: LawyerActivityItem[] = documents.map((document) => {
    const caseItem = casesById.get(document.case_id);
    const client = caseItem ? clientsById.get(caseItem.client_id) : undefined;

    return {
      id: `document-${document.id}`,
      type: "document_uploaded",
      title: `Documento enviado por ${getSenderLabel(document.sender_type)}`,
      description: document.file_name,
      created_at: document.created_at,
      case_id: document.case_id,
      case_title: caseItem?.title ?? "Caso não encontrado",
      client_name: getClientName(client),
      href: `/dashboard/cases/${document.case_id}`,
    };
  });

  const taskActivities: LawyerActivityItem[] = tasks.map((task) => {
    const caseItem = casesById.get(task.case_id);
    const client = caseItem ? clientsById.get(caseItem.client_id) : undefined;

    return {
      id: `task-${task.id}`,
      type: "task_created",
      title: "Tarefa criada",
      description: task.title,
      created_at: task.created_at,
      case_id: task.case_id,
      case_title: caseItem?.title ?? "Caso não encontrado",
      client_name: getClientName(client),
      href: `/dashboard/cases/${task.case_id}`,
    };
  });

  const noteActivities: LawyerActivityItem[] = notes.map((note) => {
    const caseItem = casesById.get(note.case_id);
    const client = caseItem ? clientsById.get(caseItem.client_id) : undefined;

    return {
      id: `note-${note.id}`,
      type: "note_created",
      title: "Nota interna criada",
      description: limitText(note.content, 140),
      created_at: note.created_at,
      case_id: note.case_id,
      case_title: caseItem?.title ?? "Caso não encontrado",
      client_name: getClientName(client),
      href: `/dashboard/cases/${note.case_id}`,
    };
  });

  const activities = [
    ...caseActivities,
    ...messageActivities,
    ...documentActivities,
    ...taskActivities,
    ...noteActivities,
  ]
    .sort(sortActivitiesByDate)
    .slice(0, 120);

  return {
    summary: {
      total: activities.length,
      cases: caseActivities.length,
      messages: messageActivities.length,
      documents: documentActivities.length,
      tasks: taskActivities.length,
      notes: noteActivities.length,
    },
    activities,
  };
}