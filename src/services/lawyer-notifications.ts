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
type CaseTaskRow = Database["public"]["Tables"]["case_tasks"]["Row"];

type MeetingStatus =
  | "requested"
  | "scheduled"
  | "completed"
  | "canceled";

type MeetingLocationType =
  | "online"
  | "presential"
  | "phone";

type MeetingRow = {
  id: string;
  tenant_id: string;
  client_id: string | null;
  case_id: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  meeting_at: string;
  duration_minutes: number;
  location_type: MeetingLocationType;
  location: string | null;
  status: MeetingStatus;
  created_at: string;
  updated_at: string;
};

type SupabaseError = {
  message: string;
};

type QueryResult<T> = {
  data: T | null;
  error: SupabaseError | null;
};

type MeetingQueryBuilder = {
  select: (columns: string) => MeetingQueryBuilder;

  eq: (
    column: string,
    value: string | number | boolean | null,
  ) => MeetingQueryBuilder;

  order: (
    column: string,
    options?: {
      ascending?: boolean;
      nullsFirst?: boolean;
    },
  ) => MeetingQueryBuilder;

  limit: (count: number) => MeetingQueryBuilder;
};

export type LawyerNotificationType =
  | "new_client"
  | "new_case"
  | "client_message"
  | "client_document"
  | "task_overdue"
  | "task_due_today"
  | "waiting_client"
  | "meeting_requested"
  | "meeting_today";

export type LawyerNotificationPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type LawyerNotification = {
  id: string;
  type: LawyerNotificationType;
  priority: LawyerNotificationPriority;
  title: string;
  description: string;
  href: string;
  case_id: string;
  case_title: string;
  client_name: string | null;
  created_at: string;
  due_date: string | null;
};

export type LawyerNotificationsResult = {
  notifications: LawyerNotification[];

  summary: {
    total: number;
    urgent: number;
    high: number;
    new_clients: number;
    new_cases: number;
    client_messages: number;
    client_documents: number;
    overdue_tasks: number;
    due_today_tasks: number;
    waiting_client_cases: number;
    meeting_requests: number;
    meetings_today: number;
  };
};

function meetingsTable(): MeetingQueryBuilder {
  const admin = createSupabaseAdminClient();

  return admin
    .from("meetings" as never) as unknown as MeetingQueryBuilder;
}

async function resolveMeetingRows(
  builder: MeetingQueryBuilder,
): Promise<MeetingRow[]> {
  const result =
    (await builder) as unknown as QueryResult<MeetingRow[]>;

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

function isAllowedTenantMemberRole(
  role: string,
): boolean {
  return role === "owner" || role === "staff";
}

function getTodayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function getSevenDaysAgoIso(): string {
  const date = new Date();

  date.setDate(date.getDate() - 7);

  return date.toISOString();
}

function getTodayRangeIso(): {
  start: string;
  end: string;
} {
  const start = new Date();

  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  end.setDate(end.getDate() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function isTaskOverdue(
  task: CaseTaskRow,
  today: string,
): boolean {
  if (task.status === "done") {
    return false;
  }

  if (!task.due_date) {
    return false;
  }

  return task.due_date < today;
}

function isTaskDueToday(
  task: CaseTaskRow,
  today: string,
): boolean {
  if (task.status === "done") {
    return false;
  }

  return task.due_date === today;
}

function getTaskNotificationPriority(
  taskPriority: string,
): LawyerNotificationPriority {
  if (taskPriority === "urgent") {
    return "urgent";
  }

  if (taskPriority === "high") {
    return "high";
  }

  if (taskPriority === "low") {
    return "low";
  }

  return "medium";
}

function getCaseNotificationPriority(
  casePriority: string,
): LawyerNotificationPriority {
  if (casePriority === "urgent") {
    return "urgent";
  }

  if (casePriority === "high") {
    return "high";
  }

  if (casePriority === "low") {
    return "low";
  }

  return "medium";
}

function getNotificationWeight(
  notification: LawyerNotification,
): number {
  if (notification.priority === "urgent") {
    return 1;
  }

  if (notification.priority === "high") {
    return 2;
  }

  if (notification.priority === "medium") {
    return 3;
  }

  return 4;
}

function sortNotifications(
  first: LawyerNotification,
  second: LawyerNotification,
): number {
  const firstWeight =
    getNotificationWeight(first);

  const secondWeight =
    getNotificationWeight(second);

  if (firstWeight !== secondWeight) {
    return firstWeight - secondWeight;
  }

  return (
    new Date(second.created_at).getTime() -
    new Date(first.created_at).getTime()
  );
}

function limitDescription(
  value: string | null,
  fallback: string,
): string {
  const text = value?.trim() || fallback;

  if (text.length <= 220) {
    return text;
  }

  return `${text.slice(0, 220).trim()}...`;
}

function formatMeetingDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getMeetingLocationLabel(
  locationType: MeetingLocationType,
): string {
  if (locationType === "presential") {
    return "presencial";
  }

  if (locationType === "phone") {
    return "por telefone";
  }

  return "online";
}

async function getAuthorizedNotificationsContext(): Promise<{
  tenantId: string;
}> {
  const context = await requireUserContext();

  if (context.role === "client") {
    redirect("/dashboard/client");
  }

  if (!isAllowedProfileRole(context.role)) {
    redirect("/dashboard");
  }

  if (!context.tenant) {
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
    !isAllowedTenantMemberRole(membership.role)
  ) {
    redirect("/dashboard");
  }

  return {
    tenantId: context.tenant.id,
  };
}

export async function listLawyerNotifications(): Promise<LawyerNotificationsResult> {
  const { tenantId } =
    await getAuthorizedNotificationsContext();

  const admin = createSupabaseAdminClient();

  const sevenDaysAgoIso =
    getSevenDaysAgoIso();

  const today = getTodayDateOnly();

  const todayRange = getTodayRangeIso();

  const {
    data: casesData,
    error: casesError,
  } = await admin
    .from("cases")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", {
      ascending: false,
    });

  if (casesError) {
    throw new Error(casesError.message);
  }

  const {
    data: clientsData,
    error: clientsError,
  } = await admin
    .from("clients")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", {
      ascending: false,
    });

  if (clientsError) {
    throw new Error(clientsError.message);
  }

  const {
    data: messagesData,
    error: messagesError,
  } = await admin
    .from("messages")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("sender_type", "client")
    .gte("created_at", sevenDaysAgoIso)
    .order("created_at", {
      ascending: false,
    })
    .limit(30);

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const {
    data: documentsData,
    error: documentsError,
  } = await admin
    .from("case_documents")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("sender_type", "client")
    .gte("created_at", sevenDaysAgoIso)
    .order("created_at", {
      ascending: false,
    })
    .limit(30);

  if (documentsError) {
    throw new Error(documentsError.message);
  }

  const {
    data: tasksData,
    error: tasksError,
  } = await admin
    .from("case_tasks")
    .select("*")
    .eq("tenant_id", tenantId)
    .neq("status", "done")
    .order("due_date", {
      ascending: true,
      nullsFirst: false,
    })
    .limit(80);

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  /*
   * As reuniões não possuem mais filtro por data de criação.
   *
   * Assim:
   * - toda solicitação ainda pendente continua aparecendo;
   * - uma reunião criada há mais de sete dias, mas marcada
   *   para hoje, também será exibida.
   */
  const meetings = await resolveMeetingRows(
    meetingsTable()
      .select("*")
      .eq("tenant_id", tenantId)
      .order("meeting_at", {
        ascending: true,
      })
      .limit(200),
  );

  const cases: CaseRow[] =
    casesData ?? [];

  const clients: ClientRow[] =
    clientsData ?? [];

  const messages: MessageRow[] =
    messagesData ?? [];

  const documents: CaseDocumentRow[] =
    documentsData ?? [];

  const tasks: CaseTaskRow[] =
    tasksData ?? [];

  const casesById =
    new Map<string, CaseRow>();

  const clientsById =
    new Map<string, ClientRow>();

  cases.forEach((legalCase) => {
    casesById.set(
      legalCase.id,
      legalCase,
    );
  });

  clients.forEach((client) => {
    clientsById.set(
      client.id,
      client,
    );
  });

  const notifications: LawyerNotification[] = [];

  clients
    .filter(
      (client) =>
        client.created_at >= sevenDaysAgoIso,
    )
    .slice(0, 20)
    .forEach((client) => {
      notifications.push({
        id: `new-client-${client.id}`,
        type: "new_client",
        priority: "medium",
        title: "Novo cliente cadastrado",
        description: `${client.name} entrou na base do escritório.`,
        href: `/dashboard/clients/${client.id}`,
        case_id: "",
        case_title: "Cadastro de cliente",
        client_name: client.name,
        created_at: client.created_at,
        due_date: null,
      });
    });

  cases
    .filter(
      (legalCase) =>
        legalCase.created_at >= sevenDaysAgoIso,
    )
    .slice(0, 30)
    .forEach((legalCase) => {
      const client = clientsById.get(
        legalCase.client_id,
      );

      notifications.push({
        id: `new-case-${legalCase.id}`,
        type: "new_case",
        priority:
          getCaseNotificationPriority(
            legalCase.priority,
          ),
        title: "Novo caso criado",
        description: limitDescription(
          legalCase.description,
          "Novo atendimento jurídico criado.",
        ),
        href: `/dashboard/cases/${legalCase.id}`,
        case_id: legalCase.id,
        case_title: legalCase.title,
        client_name: client?.name ?? null,
        created_at: legalCase.created_at,
        due_date: null,
      });
    });

  messages.forEach((message) => {
    const legalCase =
      casesById.get(message.case_id);

    const client = legalCase
      ? clientsById.get(
          legalCase.client_id,
        )
      : null;

    if (!legalCase) {
      return;
    }

    notifications.push({
      id: `message-${message.id}`,
      type: "client_message",
      priority: "high",
      title: "Nova mensagem do cliente",
      description: limitDescription(
        message.content,
        "Mensagem recebida.",
      ),
      href: `/dashboard/cases/${legalCase.id}`,
      case_id: legalCase.id,
      case_title: legalCase.title,
      client_name: client?.name ?? null,
      created_at: message.created_at,
      due_date: null,
    });
  });

  documents.forEach((document) => {
    const legalCase =
      casesById.get(document.case_id);

    const client = legalCase
      ? clientsById.get(
          legalCase.client_id,
        )
      : null;

    if (!legalCase) {
      return;
    }

    notifications.push({
      id: `document-${document.id}`,
      type: "client_document",
      priority: "high",
      title:
        "Novo documento enviado pelo cliente",
      description:
        document.file_name,
      href: `/dashboard/cases/${legalCase.id}`,
      case_id: legalCase.id,
      case_title: legalCase.title,
      client_name: client?.name ?? null,
      created_at: document.created_at,
      due_date: null,
    });
  });

  meetings.forEach((meeting) => {
    const legalCase =
      meeting.case_id
        ? casesById.get(meeting.case_id)
        : null;

    const client =
      meeting.client_id
        ? clientsById.get(meeting.client_id)
        : null;

    const meetingDate =
      new Date(meeting.meeting_at);

    const isToday =
      meeting.meeting_at >=
        todayRange.start &&
      meeting.meeting_at <
        todayRange.end;

    if (meeting.status === "requested") {
      notifications.push({
        id: `meeting-requested-${meeting.id}`,
        type: "meeting_requested",
        priority: "high",
        title: "Cliente solicitou reunião",
        description: `${
          client?.name ?? "Cliente"
        } solicitou reunião ${getMeetingLocationLabel(
          meeting.location_type,
        )} para ${formatMeetingDateTime(
          meeting.meeting_at,
        )}.`,
        href: "/dashboard/meetings",
        case_id:
          meeting.case_id ?? "",
        case_title:
          legalCase?.title ??
          meeting.title,
        client_name:
          client?.name ?? null,
        created_at:
          meeting.created_at,
        due_date:
          meeting.meeting_at.slice(0, 10),
      });
    }

    if (
      isToday &&
      meeting.status !== "completed" &&
      meeting.status !== "canceled" &&
      !Number.isNaN(
        meetingDate.getTime(),
      )
    ) {
      notifications.push({
        id: `meeting-today-${meeting.id}`,
        type: "meeting_today",
        priority: "urgent",
        title:
          "Reunião marcada para hoje",
        description: `${
          meeting.title
        } está marcada para ${formatMeetingDateTime(
          meeting.meeting_at,
        )}.`,
        href: "/dashboard/meetings",
        case_id:
          meeting.case_id ?? "",
        case_title:
          legalCase?.title ??
          meeting.title,
        client_name:
          client?.name ?? null,
        created_at:
          meeting.meeting_at,
        due_date:
          meeting.meeting_at.slice(0, 10),
      });
    }
  });

  tasks.forEach((task) => {
    const legalCase =
      casesById.get(task.case_id);

    const client = legalCase
      ? clientsById.get(
          legalCase.client_id,
        )
      : null;

    if (!legalCase) {
      return;
    }

    if (
      isTaskOverdue(task, today)
    ) {
      notifications.push({
        id: `task-overdue-${task.id}`,
        type: "task_overdue",
        priority: "urgent",
        title: "Tarefa atrasada",
        description: task.title,
        href: `/dashboard/cases/${legalCase.id}`,
        case_id: legalCase.id,
        case_title: legalCase.title,
        client_name:
          client?.name ?? null,
        created_at: task.created_at,
        due_date: task.due_date,
      });

      return;
    }

    if (
      isTaskDueToday(task, today)
    ) {
      notifications.push({
        id: `task-today-${task.id}`,
        type: "task_due_today",
        priority:
          getTaskNotificationPriority(
            task.priority,
          ),
        title: "Tarefa vence hoje",
        description: task.title,
        href: `/dashboard/cases/${legalCase.id}`,
        case_id: legalCase.id,
        case_title: legalCase.title,
        client_name:
          client?.name ?? null,
        created_at: task.created_at,
        due_date: task.due_date,
      });
    }
  });

  cases
    .filter(
      (legalCase) =>
        legalCase.status ===
        "waiting_client",
    )
    .forEach((legalCase) => {
      const client =
        clientsById.get(
          legalCase.client_id,
        );

      notifications.push({
        id: `waiting-client-${legalCase.id}`,
        type: "waiting_client",
        priority: "low",
        title:
          "Caso aguardando cliente",
        description: limitDescription(
          legalCase.description,
          "Caso marcado como aguardando cliente.",
        ),
        href: `/dashboard/cases/${legalCase.id}`,
        case_id: legalCase.id,
        case_title: legalCase.title,
        client_name:
          client?.name ?? null,
        created_at:
          legalCase.updated_at ??
          legalCase.created_at,
        due_date: null,
      });
    });

  const sortedNotifications =
    notifications.sort(
      sortNotifications,
    );

  return {
    notifications:
      sortedNotifications,

    summary: {
      total:
        sortedNotifications.length,

      urgent:
        sortedNotifications.filter(
          (notification) =>
            notification.priority ===
            "urgent",
        ).length,

      high:
        sortedNotifications.filter(
          (notification) =>
            notification.priority ===
            "high",
        ).length,

      new_clients:
        sortedNotifications.filter(
          (notification) =>
            notification.type ===
            "new_client",
        ).length,

      new_cases:
        sortedNotifications.filter(
          (notification) =>
            notification.type ===
            "new_case",
        ).length,

      client_messages:
        sortedNotifications.filter(
          (notification) =>
            notification.type ===
            "client_message",
        ).length,

      client_documents:
        sortedNotifications.filter(
          (notification) =>
            notification.type ===
            "client_document",
        ).length,

      overdue_tasks:
        sortedNotifications.filter(
          (notification) =>
            notification.type ===
            "task_overdue",
        ).length,

      due_today_tasks:
        sortedNotifications.filter(
          (notification) =>
            notification.type ===
            "task_due_today",
        ).length,

      waiting_client_cases:
        sortedNotifications.filter(
          (notification) =>
            notification.type ===
            "waiting_client",
        ).length,

      meeting_requests:
        sortedNotifications.filter(
          (notification) =>
            notification.type ===
            "meeting_requested",
        ).length,

      meetings_today:
        sortedNotifications.filter(
          (notification) =>
            notification.type ===
            "meeting_today",
        ).length,
    },
  };
}