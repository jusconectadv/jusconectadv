"use server";

import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/types/supabase";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type CaseDocumentRow =
  Database["public"]["Tables"]["case_documents"]["Row"];
type CaseTaskRow = Database["public"]["Tables"]["case_tasks"]["Row"];

type CaseStatus =
  | "new"
  | "in_progress"
  | "waiting_client"
  | "closed"
  | "resolved";

export type DashboardOverviewCase = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  client_name: string | null;
};

export type DashboardOverviewMessage = {
  id: string;
  content: string;
  sender_type: string;
  created_at: string;
  case_id: string;
  case_title: string;
  client_name: string | null;
};

export type DashboardOverviewDocument = {
  id: string;
  file_name: string;
  sender_type: string;
  created_at: string;
  case_id: string;
  case_title: string;
  client_name: string | null;
};

export type DashboardOverviewTask = {
  id: string;
  title: string;
  priority: string;
  due_date: string | null;
  case_id: string;
  case_title: string;
  client_name: string | null;
  is_overdue: boolean;
  is_due_today: boolean;
};

export type DashboardOverviewSummary = {
  total_clients: number;
  active_clients: number;
  archived_clients: number;
  pf_clients: number;
  pj_clients: number;
  total_cases: number;
  new_cases: number;
  in_progress_cases: number;
  waiting_client_cases: number;
  closed_cases: number;
  pending_tasks: number;
  overdue_tasks: number;
  due_today_tasks: number;
  recent_messages: number;
  recent_documents: number;
};

export type DashboardOverviewResult = {
  tenant_id: string;
  tenant_name: string;
  summary: DashboardOverviewSummary;
  latest_cases: DashboardOverviewCase[];
  latest_messages: DashboardOverviewMessage[];
  latest_documents: DashboardOverviewDocument[];
  urgent_tasks: DashboardOverviewTask[];
};

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function getClientName(client: ClientRow | undefined): string | null {
  if (!client) {
    return null;
  }

  return client.name ?? null;
}

function getTodayDateOnly(): Date {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseDateOnly(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split("-");

  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function isCaseStatus(
  status: string,
  expectedStatus: CaseStatus,
): boolean {
  return status === expectedStatus;
}

function isCaseClosed(status: string): boolean {
  return status === "closed" || status === "resolved";
}

function isTaskPending(task: CaseTaskRow): boolean {
  return task.status !== "done";
}

function getIsOverdue(dueDate: string | null): boolean {
  const parsedDueDate = parseDateOnly(dueDate);

  if (!parsedDueDate) {
    return false;
  }

  return parsedDueDate < getTodayDateOnly();
}

function getIsDueToday(dueDate: string | null): boolean {
  const parsedDueDate = parseDateOnly(dueDate);

  if (!parsedDueDate) {
    return false;
  }

  return parsedDueDate.getTime() === getTodayDateOnly().getTime();
}

function getPriorityWeight(priority: string): number {
  if (priority === "urgent") {
    return 1;
  }

  if (priority === "high") {
    return 2;
  }

  if (priority === "medium") {
    return 3;
  }

  if (priority === "low") {
    return 4;
  }

  return 5;
}

function sortTasksByUrgency(
  first: DashboardOverviewTask,
  second: DashboardOverviewTask,
): number {
  if (first.is_overdue !== second.is_overdue) {
    return first.is_overdue ? -1 : 1;
  }

  if (first.is_due_today !== second.is_due_today) {
    return first.is_due_today ? -1 : 1;
  }

  const firstPriorityWeight = getPriorityWeight(first.priority);
  const secondPriorityWeight = getPriorityWeight(second.priority);

  if (firstPriorityWeight !== secondPriorityWeight) {
    return firstPriorityWeight - secondPriorityWeight;
  }

  const firstDueTime =
    parseDateOnly(first.due_date)?.getTime() ??
    Number.MAX_SAFE_INTEGER;

  const secondDueTime =
    parseDateOnly(second.due_date)?.getTime() ??
    Number.MAX_SAFE_INTEGER;

  return firstDueTime - secondDueTime;
}

function limitItems<TItem>(
  items: TItem[],
  limit: number,
): TItem[] {
  return items.slice(0, limit);
}

export async function getDashboardOverview(): Promise<DashboardOverviewResult> {
  const context = await requireUserContext();

  if (context.role === "client") {
    redirect("/dashboard/client");
  }

  if (context.role === "master" && !context.tenant) {
    redirect("/dashboard/master");
  }

  if (
    context.role !== "lawyer" &&
    context.role !== "master"
  ) {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard/lawyer");
  }

  const supabase = await createSupabaseServerClient();

  const { data: clientsData, error: clientsError } =
    await supabase
      .from("clients")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .order("created_at", { ascending: false });

  if (clientsError) {
    throw new Error(
      "Não foi possível carregar os clientes do dashboard.",
    );
  }

  const { data: casesData, error: casesError } =
    await supabase
      .from("cases")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .order("created_at", { ascending: false });

  if (casesError) {
    throw new Error(
      "Não foi possível carregar os casos do dashboard.",
    );
  }

  const { data: tasksData, error: tasksError } =
    await supabase
      .from("case_tasks")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .order("created_at", { ascending: false })
      .limit(120);

  if (tasksError) {
    throw new Error(
      "Não foi possível carregar as tarefas do dashboard.",
    );
  }

  const { data: messagesData, error: messagesError } =
    await supabase
      .from("messages")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .order("created_at", { ascending: false })
      .limit(20);

  if (messagesError) {
    throw new Error(
      "Não foi possível carregar as mensagens recentes.",
    );
  }

  const { data: documentsData, error: documentsError } =
    await supabase
      .from("case_documents")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .order("created_at", { ascending: false })
      .limit(20);

  if (documentsError) {
    throw new Error(
      "Não foi possível carregar os documentos recentes.",
    );
  }

  const clients: ClientRow[] = clientsData ?? [];
  const cases: CaseRow[] = casesData ?? [];
  const tasks: CaseTaskRow[] = tasksData ?? [];
  const messages: MessageRow[] = messagesData ?? [];
  const documents: CaseDocumentRow[] = documentsData ?? [];

  const relatedCaseIds = uniqueStrings([
    ...cases.map((caseItem) => caseItem.id),
    ...tasks.map((task) => task.case_id),
    ...messages.map((message) => message.case_id),
    ...documents.map((document) => document.case_id),
  ]);

  let relatedCases: CaseRow[] = cases;

  if (relatedCaseIds.length > 0) {
    const {
      data: relatedCasesData,
      error: relatedCasesError,
    } = await supabase
      .from("cases")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .in("id", relatedCaseIds);

    if (relatedCasesError) {
      throw new Error(
        "Não foi possível carregar os casos relacionados.",
      );
    }

    relatedCases = relatedCasesData ?? [];
  }

  const clientIds = uniqueStrings(
    relatedCases
      .map((caseItem) => caseItem.client_id)
      .filter((clientId) => clientId.length > 0),
  );

  let relatedClients: ClientRow[] = [];

  if (clientIds.length > 0) {
    const {
      data: relatedClientsData,
      error: relatedClientsError,
    } = await supabase
      .from("clients")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .in("id", clientIds);

    if (relatedClientsError) {
      throw new Error(
        "Não foi possível carregar os clientes do dashboard.",
      );
    }

    relatedClients = relatedClientsData ?? [];
  }

  const casesById = new Map<string, CaseRow>();
  const clientsById = new Map<string, ClientRow>();

  relatedCases.forEach((caseItem) => {
    casesById.set(caseItem.id, caseItem);
  });

  relatedClients.forEach((client) => {
    clientsById.set(client.id, client);
  });

  const pendingTasks = tasks.filter(isTaskPending);

  const latestCases: DashboardOverviewCase[] =
    limitItems(
      cases.filter(
        (caseItem) => !isCaseClosed(caseItem.status),
      ),
      6,
    ).map((caseItem) => {
      const client = clientsById.get(caseItem.client_id);

      return {
        id: caseItem.id,
        title: caseItem.title,
        description: caseItem.description,
        status: caseItem.status,
        priority: caseItem.priority,
        created_at: caseItem.created_at,
        client_name: getClientName(client),
      };
    });

  const latestMessages: DashboardOverviewMessage[] =
    limitItems(messages, 5).map((message) => {
      const caseItem = casesById.get(message.case_id);

      const client = caseItem
        ? clientsById.get(caseItem.client_id)
        : undefined;

      return {
        id: message.id,
        content: message.content,
        sender_type: message.sender_type,
        created_at: message.created_at,
        case_id: message.case_id,
        case_title:
          caseItem?.title ?? "Caso não encontrado",
        client_name: getClientName(client),
      };
    });

  const latestDocuments: DashboardOverviewDocument[] =
    limitItems(documents, 5).map((document) => {
      const caseItem = casesById.get(document.case_id);

      const client = caseItem
        ? clientsById.get(caseItem.client_id)
        : undefined;

      return {
        id: document.id,
        file_name: document.file_name,
        sender_type: document.sender_type,
        created_at: document.created_at,
        case_id: document.case_id,
        case_title:
          caseItem?.title ?? "Caso não encontrado",
        client_name: getClientName(client),
      };
    });

  const urgentTasks: DashboardOverviewTask[] =
    limitItems(
      pendingTasks
        .map((task) => {
          const caseItem = casesById.get(task.case_id);

          const client = caseItem
            ? clientsById.get(caseItem.client_id)
            : undefined;

          return {
            id: task.id,
            title: task.title,
            priority: task.priority,
            due_date: task.due_date,
            case_id: task.case_id,
            case_title:
              caseItem?.title ?? "Caso não encontrado",
            client_name: getClientName(client),
            is_overdue: getIsOverdue(task.due_date),
            is_due_today: getIsDueToday(task.due_date),
          };
        })
        .sort(sortTasksByUrgency),
      6,
    );

  return {
    tenant_id: context.tenant.id,
    tenant_name: context.tenant.name,

    summary: {
      total_clients: clients.length,

      active_clients: clients.filter(
        (client) => client.active,
      ).length,

      archived_clients: clients.filter(
        (client) => !client.active,
      ).length,

      pf_clients: clients.filter(
        (client) => client.type === "PF",
      ).length,

      pj_clients: clients.filter(
        (client) => client.type === "PJ",
      ).length,

      total_cases: cases.length,

      new_cases: cases.filter((caseItem) =>
        isCaseStatus(caseItem.status, "new"),
      ).length,

      in_progress_cases: cases.filter((caseItem) =>
        isCaseStatus(caseItem.status, "in_progress"),
      ).length,

      waiting_client_cases: cases.filter((caseItem) =>
        isCaseStatus(caseItem.status, "waiting_client"),
      ).length,

      closed_cases: cases.filter((caseItem) =>
        isCaseClosed(caseItem.status),
      ).length,

      pending_tasks: pendingTasks.length,

      overdue_tasks: pendingTasks.filter((task) =>
        getIsOverdue(task.due_date),
      ).length,

      due_today_tasks: pendingTasks.filter((task) =>
        getIsDueToday(task.due_date),
      ).length,

      recent_messages: messages.length,
      recent_documents: documents.length,
    },

    latest_cases: latestCases,
    latest_messages: latestMessages,
    latest_documents: latestDocuments,
    urgent_tasks: urgentTasks,
  };
}