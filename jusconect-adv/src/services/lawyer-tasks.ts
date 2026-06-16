"use server";

import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/types/supabase";

type CaseTaskRow = Database["public"]["Tables"]["case_tasks"]["Row"];
type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export type LawyerTaskStatus = "todo" | "done";
export type LawyerTaskPriority = "low" | "medium" | "high" | "urgent";

export type LawyerTaskDueGroup =
  | "overdue"
  | "today"
  | "next_7_days"
  | "no_due_date"
  | "future"
  | "done";

export type LawyerTaskListItem = {
  task: CaseTaskRow;
  case_id: string;
  case_title: string;
  client_name: string | null;
  due_group: LawyerTaskDueGroup;
};

export type LawyerTaskSummary = {
  total_pending: number;
  overdue: number;
  due_today: number;
  next_7_days: number;
};

export type LawyerTasksResult = {
  summary: LawyerTaskSummary;
  tasks: LawyerTaskListItem[];
};

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

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function getTaskDueGroup(task: CaseTaskRow): LawyerTaskDueGroup {
  if (task.status === "done") {
    return "done";
  }

  const dueDate = parseDateOnly(task.due_date);

  if (!dueDate) {
    return "no_due_date";
  }

  const today = getTodayDateOnly();
  const nextSevenDays = addDays(today, 7);

  if (dueDate < today) {
    return "overdue";
  }

  if (dueDate.getTime() === today.getTime()) {
    return "today";
  }

  if (dueDate > today && dueDate <= nextSevenDays) {
    return "next_7_days";
  }

  return "future";
}

function getDatePriorityWeight(group: LawyerTaskDueGroup): number {
  const weights: Record<LawyerTaskDueGroup, number> = {
    overdue: 1,
    today: 2,
    next_7_days: 3,
    future: 4,
    no_due_date: 5,
    done: 6,
  };

  return weights[group];
}

function getPriorityWeight(priority: string): number {
  const weights: Record<LawyerTaskPriority, number> = {
    urgent: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  if (
    priority === "urgent" ||
    priority === "high" ||
    priority === "medium" ||
    priority === "low"
  ) {
    return weights[priority];
  }

  return 5;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function getClientName(client: ClientRow | undefined): string | null {
  if (!client) {
    return null;
  }

  return client.name ?? null;
}

export async function listLawyerTasks(): Promise<LawyerTasksResult> {
  const context = await requireUserContext();

  if (
    context.role !== "lawyer" &&
    context.role !== "master"
  ) {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data: tasks, error: tasksError } = await supabase
    .from("case_tasks")
    .select("*")
    .eq("tenant_id", context.tenant.id)
    .order("status", { ascending: false })
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (tasksError) {
    throw new Error("Não foi possível carregar as tarefas do escritório.");
  }

  const safeTasks: CaseTaskRow[] = tasks ?? [];

  const caseIds = uniqueStrings(
    safeTasks
      .map((task) => task.case_id)
      .filter((caseId) => caseId.length > 0),
  );

  let cases: CaseRow[] = [];

  if (caseIds.length > 0) {
    const { data: casesData, error: casesError } = await supabase
      .from("cases")
      .select("*")
      .eq("tenant_id", context.tenant.id)
      .in("id", caseIds);

    if (casesError) {
      throw new Error("Não foi possível carregar os casos vinculados às tarefas.");
    }

    cases = casesData ?? [];
  }

  const clientIds = uniqueStrings(
    cases
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
      throw new Error("Não foi possível carregar os clientes vinculados às tarefas.");
    }

    clients = clientsData ?? [];
  }

  const casesById = new Map<string, CaseRow>();
  const clientsById = new Map<string, ClientRow>();

  cases.forEach((caseItem) => {
    casesById.set(caseItem.id, caseItem);
  });

  clients.forEach((client) => {
    clientsById.set(client.id, client);
  });

  const taskItems: LawyerTaskListItem[] = safeTasks.map((task) => {
    const relatedCase = casesById.get(task.case_id);
    const relatedClient = relatedCase
      ? clientsById.get(relatedCase.client_id)
      : undefined;

    return {
      task,
      case_id: task.case_id,
      case_title: relatedCase?.title ?? "Caso não encontrado",
      client_name: getClientName(relatedClient),
      due_group: getTaskDueGroup(task),
    };
  });

  taskItems.sort((first, second) => {
    const firstDateWeight = getDatePriorityWeight(first.due_group);
    const secondDateWeight = getDatePriorityWeight(second.due_group);

    if (firstDateWeight !== secondDateWeight) {
      return firstDateWeight - secondDateWeight;
    }

    const firstPriorityWeight = getPriorityWeight(first.task.priority);
    const secondPriorityWeight = getPriorityWeight(second.task.priority);

    if (firstPriorityWeight !== secondPriorityWeight) {
      return firstPriorityWeight - secondPriorityWeight;
    }

    const firstDueTime = parseDateOnly(first.task.due_date)?.getTime() ?? 0;
    const secondDueTime = parseDateOnly(second.task.due_date)?.getTime() ?? 0;

    return firstDueTime - secondDueTime;
  });

  const pendingTasks = taskItems.filter((item) => item.task.status !== "done");

  return {
    summary: {
      total_pending: pendingTasks.length,
      overdue: pendingTasks.filter((item) => item.due_group === "overdue")
        .length,
      due_today: pendingTasks.filter((item) => item.due_group === "today")
        .length,
      next_7_days: pendingTasks.filter(
        (item) => item.due_group === "next_7_days",
      ).length,
    },
    tasks: taskItems,
  };
}