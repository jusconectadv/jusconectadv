"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/supabase";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export type MeetingStatus =
  | "requested"
  | "scheduled"
  | "completed"
  | "canceled";

export type MeetingLocationType = "online" | "presential" | "phone";

export type MeetingRow = {
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

type MeetingInsert = {
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
  insert: (values: MeetingInsert | MeetingInsert[]) => MeetingQueryBuilder;
  update: (values: Partial<MeetingRow>) => MeetingQueryBuilder;
  single: () => MeetingQueryBuilder;
};

export type MeetingWithRelations = MeetingRow & {
  case_title: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
};

export type MeetingCaseOption = {
  id: string;
  title: string;
  client_id: string;
  client_name: string;
};

export type LawyerMeetingsData = {
  meetings: MeetingWithRelations[];
  cases: MeetingCaseOption[];
  summary: {
    total: number;
    requested: number;
    scheduled: number;
    today: number;
    upcoming: number;
  };
};

export type ClientMeetingsData = {
  meetings: MeetingWithRelations[];
  cases: MeetingCaseOption[];
  summary: {
    total: number;
    requested: number;
    scheduled: number;
    today: number;
    upcoming: number;
  };
};

function meetingsTable(): MeetingQueryBuilder {
  const admin = createSupabaseAdminClient();

  return admin.from("meetings" as never) as unknown as MeetingQueryBuilder;
}

async function resolveMeetingRows(
  builder: MeetingQueryBuilder,
): Promise<MeetingRow[]> {
  const result = (await builder) as unknown as QueryResult<MeetingRow[]>;

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

async function resolveMeetingRow(
  builder: MeetingQueryBuilder,
): Promise<MeetingRow | null> {
  const result = (await builder) as unknown as QueryResult<MeetingRow>;

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? null;
}

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getNumberField(
  formData: FormData,
  field: string,
  fallback: number,
): number {
  const value = getStringField(formData, field);
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function getValidMeetingStatus(value: string): MeetingStatus {
  if (
    value === "requested" ||
    value === "scheduled" ||
    value === "completed" ||
    value === "canceled"
  ) {
    return value;
  }

  return "requested";
}

function getValidLocationType(value: string): MeetingLocationType {
  if (value === "online" || value === "presential" || value === "phone") {
    return value;
  }

  return "online";
}

function parseMeetingDateTime(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getTodayRange(): {
  start: Date;
  end: Date;
} {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    start,
    end,
  };
}

function buildEmptySummary() {
  return {
    total: 0,
    requested: 0,
    scheduled: 0,
    today: 0,
    upcoming: 0,
  };
}

function buildSummary(meetings: MeetingWithRelations[]) {
  const now = new Date();
  const todayRange = getTodayRange();

  return {
    total: meetings.length,
    requested: meetings.filter((meeting) => meeting.status === "requested")
      .length,
    scheduled: meetings.filter((meeting) => meeting.status === "scheduled")
      .length,
    today: meetings.filter((meeting) => {
      const date = new Date(meeting.meeting_at);

      return date >= todayRange.start && date < todayRange.end;
    }).length,
    upcoming: meetings.filter((meeting) => {
      const date = new Date(meeting.meeting_at);

      return (
        date >= now &&
        meeting.status !== "completed" &&
        meeting.status !== "canceled"
      );
    }).length,
  };
}

function hydrateMeetings(params: {
  meetings: MeetingRow[];
  cases: CaseRow[];
  clients: ClientRow[];
}): MeetingWithRelations[] {
  const casesById = new Map<string, CaseRow>();
  const clientsById = new Map<string, ClientRow>();

  params.cases.forEach((legalCase) => {
    casesById.set(legalCase.id, legalCase);
  });

  params.clients.forEach((client) => {
    clientsById.set(client.id, client);
  });

  return params.meetings.map((meeting) => {
    const legalCase = meeting.case_id ? casesById.get(meeting.case_id) : null;
    const client = meeting.client_id ? clientsById.get(meeting.client_id) : null;

    return {
      ...meeting,
      case_title: legalCase?.title ?? null,
      client_name: client?.name ?? null,
      client_email: client?.email ?? null,
      client_phone: client?.phone ?? null,
    };
  });
}

async function getLawyerTenantId(): Promise<{
  tenantId: string;
  userId: string;
}> {
  const context = await requireUserContext();

  if (context.role === "client") {
    redirect("/dashboard/client");
  }

  if (context.role !== "lawyer" && context.role !== "master") {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard");
  }

  return {
    tenantId: context.tenant.id,
    userId: context.user.id,
  };
}

async function getLoggedClient(): Promise<{
  client: ClientRow | null;
  userId: string;
}> {
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
      client: clientByAuthId,
      userId: context.user.id,
    };
  }

  const email = context.user.email;

  if (!email) {
    return {
      client: null,
      userId: context.user.id,
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
      client: null,
      userId: context.user.id,
    };
  }

  const updatedAt = new Date().toISOString();

  const { error: updateError } = await admin
    .from("clients")
    .update({
      auth_user_id: context.user.id,
      updated_at: updatedAt,
    })
    .eq("id", clientByEmail.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    client: {
      ...clientByEmail,
      auth_user_id: context.user.id,
      updated_at: updatedAt,
    },
    userId: context.user.id,
  };
}

async function getCasesAndClientsForTenant(tenantId: string): Promise<{
  cases: CaseRow[];
  clients: ClientRow[];
}> {
  const admin = createSupabaseAdminClient();

  const { data: cases, error: casesError } = await admin
    .from("cases")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (casesError) {
    throw new Error(casesError.message);
  }

  const { data: clients, error: clientsError } = await admin
    .from("clients")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });

  if (clientsError) {
    throw new Error(clientsError.message);
  }

  return {
    cases: cases ?? [],
    clients: clients ?? [],
  };
}

function buildCaseOptions(params: {
  cases: CaseRow[];
  clients: ClientRow[];
}): MeetingCaseOption[] {
  const clientsById = new Map<string, ClientRow>();

  params.clients.forEach((client) => {
    clientsById.set(client.id, client);
  });

  return params.cases
    .filter((legalCase) => legalCase.status !== "closed")
    .filter((legalCase) => legalCase.status !== "resolved")
    .map((legalCase) => {
      const client = clientsById.get(legalCase.client_id);

      return {
        id: legalCase.id,
        title: legalCase.title,
        client_id: legalCase.client_id,
        client_name: client?.name ?? "Cliente não informado",
      };
    });
}

export async function listLawyerMeetings(): Promise<LawyerMeetingsData> {
  const { tenantId } = await getLawyerTenantId();

  const meetings = await resolveMeetingRows(
    meetingsTable()
      .select("*")
      .eq("tenant_id", tenantId)
      .order("meeting_at", { ascending: true })
      .limit(200),
  );

  const { cases, clients } = await getCasesAndClientsForTenant(tenantId);

  const hydratedMeetings = hydrateMeetings({
    meetings,
    cases,
    clients,
  });

  return {
    meetings: hydratedMeetings,
    cases: buildCaseOptions({
      cases,
      clients,
    }),
    summary: buildSummary(hydratedMeetings),
  };
}

export async function listClientMeetings(): Promise<ClientMeetingsData> {
  const { client } = await getLoggedClient();

  if (!client) {
    return {
      meetings: [],
      cases: [],
      summary: buildEmptySummary(),
    };
  }

  const admin = createSupabaseAdminClient();

  const { data: cases, error: casesError } = await admin
    .from("cases")
    .select("*")
    .eq("tenant_id", client.tenant_id)
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (casesError) {
    throw new Error(casesError.message);
  }

  const meetings = await resolveMeetingRows(
    meetingsTable()
      .select("*")
      .eq("tenant_id", client.tenant_id)
      .eq("client_id", client.id)
      .order("meeting_at", { ascending: true })
      .limit(100),
  );

  const hydratedMeetings = hydrateMeetings({
    meetings,
    cases: cases ?? [],
    clients: [client],
  });

  return {
    meetings: hydratedMeetings,
    cases: buildCaseOptions({
      cases: cases ?? [],
      clients: [client],
    }),
    summary: buildSummary(hydratedMeetings),
  };
}

export async function createLawyerMeetingAction(
  formData: FormData,
): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const meetingAtValue = getStringField(formData, "meetingAt");
  const durationMinutes = getNumberField(formData, "durationMinutes", 60);
  const locationType = getValidLocationType(
    getStringField(formData, "locationType"),
  );
  const location = getStringField(formData, "location");

  const meetingAt = parseMeetingDateTime(meetingAtValue);

  if (!caseId || !title || !meetingAt) {
    redirect(
      `/dashboard/meetings?error=${encodeURIComponent(
        "Caso, título e data da reunião são obrigatórios.",
      )}`,
    );
  }

  const { tenantId, userId } = await getLawyerTenantId();
  const admin = createSupabaseAdminClient();

  const { data: legalCase, error: caseError } = await admin
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .eq("tenant_id", tenantId)
    .single();

  if (caseError || !legalCase) {
    redirect(
      `/dashboard/meetings?error=${encodeURIComponent(
        "Caso não encontrado.",
      )}`,
    );
  }

  const payload: MeetingInsert = {
    tenant_id: tenantId,
    client_id: legalCase.client_id,
    case_id: legalCase.id,
    created_by: userId,
    title,
    description: description || null,
    meeting_at: meetingAt,
    duration_minutes: durationMinutes,
    location_type: locationType,
    location: location || null,
    status: "scheduled",
  };

  const createdMeeting = await resolveMeetingRow(
    meetingsTable().insert(payload).select("*").single(),
  );

  if (!createdMeeting) {
    redirect(
      `/dashboard/meetings?error=${encodeURIComponent(
        "Não foi possível criar a reunião.",
      )}`,
    );
  }

  revalidatePath("/dashboard/meetings");
  revalidatePath("/dashboard/client/meetings");
  revalidatePath(`/dashboard/cases/${legalCase.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");

  redirect("/dashboard/meetings?success=meeting-created");
}

export async function requestClientMeetingAction(
  formData: FormData,
): Promise<void> {
  const caseId = getStringField(formData, "caseId");
  const title = getStringField(formData, "title") || "Solicitação de reunião";
  const description = getStringField(formData, "description");
  const meetingAtValue = getStringField(formData, "meetingAt");
  const durationMinutes = getNumberField(formData, "durationMinutes", 60);
  const locationType = getValidLocationType(
    getStringField(formData, "locationType"),
  );

  const meetingAt = parseMeetingDateTime(meetingAtValue);

  if (!caseId || !meetingAt) {
    redirect(
      `/dashboard/client/meetings?error=${encodeURIComponent(
        "Caso e data desejada são obrigatórios.",
      )}`,
    );
  }

  const { client, userId } = await getLoggedClient();

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
    redirect(
      `/dashboard/client/meetings?error=${encodeURIComponent(
        "Caso não encontrado.",
      )}`,
    );
  }

  const payload: MeetingInsert = {
    tenant_id: client.tenant_id,
    client_id: client.id,
    case_id: legalCase.id,
    created_by: userId,
    title,
    description: description || null,
    meeting_at: meetingAt,
    duration_minutes: durationMinutes,
    location_type: locationType,
    location: null,
    status: "requested",
  };

  const createdMeeting = await resolveMeetingRow(
    meetingsTable().insert(payload).select("*").single(),
  );

  if (!createdMeeting) {
    redirect(
      `/dashboard/client/meetings?error=${encodeURIComponent(
        "Não foi possível solicitar a reunião.",
      )}`,
    );
  }

  revalidatePath("/dashboard/client/meetings");
  revalidatePath("/dashboard/meetings");
  revalidatePath(`/dashboard/cases/${legalCase.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");

  redirect("/dashboard/client/meetings?success=meeting-requested");
}

export async function updateMeetingStatusAction(
  formData: FormData,
): Promise<void> {
  const meetingId = getStringField(formData, "meetingId");
  const status = getValidMeetingStatus(getStringField(formData, "status"));

  if (!meetingId) {
    redirect("/dashboard/meetings?error=Reunião inválida.");
  }

  const { tenantId } = await getLawyerTenantId();

  const meeting = await resolveMeetingRow(
    meetingsTable()
      .select("*")
      .eq("id", meetingId)
      .eq("tenant_id", tenantId)
      .single(),
  );

  if (!meeting) {
    redirect("/dashboard/meetings?error=Reunião não encontrada.");
  }

  await resolveMeetingRow(
    meetingsTable()
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", meeting.id)
      .eq("tenant_id", tenantId)
      .select("*")
      .single(),
  );

  revalidatePath("/dashboard/meetings");
  revalidatePath("/dashboard/client/meetings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");

  redirect("/dashboard/meetings?success=meeting-updated");
}