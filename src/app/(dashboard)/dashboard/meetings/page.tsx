import Link from "next/link";

import {
  createLawyerMeetingAction,
  listLawyerMeetings,
  updateMeetingStatusAction,
  type MeetingLocationType,
  type MeetingStatus,
} from "@/src/services/meetings";

type MeetingsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getStatusLabel(status: MeetingStatus): string {
  const labels: Record<MeetingStatus, string> = {
    requested: "Solicitada",
    scheduled: "Agendada",
    completed: "Concluída",
    canceled: "Cancelada",
  };

  return labels[status];
}

function getStatusClassName(status: MeetingStatus): string {
  const classes: Record<MeetingStatus, string> = {
    requested: "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]",
    scheduled: "border-blue-200 bg-blue-50 text-blue-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    canceled: "border-red-200 bg-red-50 text-red-700",
  };

  return classes[status];
}

function getLocationTypeLabel(type: MeetingLocationType): string {
  const labels: Record<MeetingLocationType, string> = {
    online: "Online",
    presential: "Presencial",
    phone: "Telefone",
  };

  return labels[type];
}

function getSuccessMessage(success: string | undefined): string | null {
  if (success === "meeting-created") {
    return "Reunião criada com sucesso.";
  }

  if (success === "meeting-updated") {
    return "Status da reunião atualizado com sucesso.";
  }

  return null;
}

export default async function MeetingsPage({
  searchParams,
}: MeetingsPageProps) {
  const query = await searchParams;
  const data = await listLawyerMeetings();
  const successMessage = getSuccessMessage(query.success);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Agenda operacional
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Agenda e reuniões
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Gerencie reuniões com clientes, acompanhe solicitações recebidas e
              organize compromissos vinculados aos casos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Voltar ao dashboard
              </Link>

              <Link
                href="/dashboard/cases"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Ver casos
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Resumo
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Total</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {data.summary.total}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Hoje</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {data.summary.today}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Solicitadas</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {data.summary.requested}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Próximas</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {data.summary.upcoming}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {query.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {query.error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Novo compromisso
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Agendar reunião
            </h2>
          </div>

          <form action={createLawyerMeetingAction} className="space-y-4 p-5">
            <div>
              <label className="text-sm font-bold text-[#0B1D2D]">Caso</label>

              <select
                name="caseId"
                required
                className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              >
                <option value="">Selecione um caso</option>

                {data.cases.map((legalCase) => (
                  <option key={legalCase.id} value={legalCase.id}>
                    {legalCase.title} — {legalCase.client_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-[#0B1D2D]">
                Título
              </label>

              <input
                name="title"
                required
                placeholder="Ex: Reunião inicial, alinhamento, retorno..."
                className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-[#0B1D2D]">
                  Data e hora
                </label>

                <input
                  type="datetime-local"
                  name="meetingAt"
                  required
                  className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#0B1D2D]">
                  Duração
                </label>

                <select
                  name="durationMinutes"
                  defaultValue="60"
                  className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                >
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1h30</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-[#0B1D2D]">
                  Tipo
                </label>

                <select
                  name="locationType"
                  defaultValue="online"
                  className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                >
                  <option value="online">Online</option>
                  <option value="presential">Presencial</option>
                  <option value="phone">Telefone</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-[#0B1D2D]">
                  Link/local
                </label>

                <input
                  name="location"
                  placeholder="Link da reunião, endereço ou telefone..."
                  className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-[#0B1D2D]">
                Observações
              </label>

              <textarea
                name="description"
                rows={4}
                placeholder="Detalhes da reunião..."
                className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Criar reunião
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Próximas reuniões
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Lista da agenda
            </h2>
          </div>

          {data.meetings.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#5B6472]">
              Nenhuma reunião cadastrada ainda.
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {data.meetings.map((meeting) => (
                <article key={meeting.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClassName(
                            meeting.status,
                          )}`}
                        >
                          {getStatusLabel(meeting.status)}
                        </span>

                        <span className="inline-flex rounded-full border border-[#D8D2C7] bg-white px-3 py-1 text-xs font-bold text-[#0B1D2D]">
                          {getLocationTypeLabel(meeting.location_type)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-[#0B1D2D]">
                        {meeting.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                        {formatDateTime(meeting.meeting_at)} •{" "}
                        {meeting.duration_minutes} min
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                        Cliente:{" "}
                        <strong className="text-[#0B1D2D]">
                          {meeting.client_name ?? "Não informado"}
                        </strong>
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#5B6472]">
                        Caso:{" "}
                        <strong className="text-[#0B1D2D]">
                          {meeting.case_title ?? "Sem caso vinculado"}
                        </strong>
                      </p>

                      {meeting.location ? (
                        <p className="mt-1 break-all text-sm leading-6 text-[#5B6472]">
                          Local/link:{" "}
                          <strong className="text-[#0B1D2D]">
                            {meeting.location}
                          </strong>
                        </p>
                      ) : null}

                      {meeting.description ? (
                        <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] p-4 text-sm leading-6 text-[#5B6472]">
                          {meeting.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:max-w-[220px]">
                      {meeting.case_id ? (
                        <Link
                          href={`/dashboard/cases/${meeting.case_id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                        >
                          Abrir caso
                        </Link>
                      ) : null}

                      <form action={updateMeetingStatusAction}>
                        <input
                          type="hidden"
                          name="meetingId"
                          value={meeting.id}
                        />
                        <input type="hidden" name="status" value="scheduled" />

                        <button
                          type="submit"
                          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          Agendada
                        </button>
                      </form>

                      <form action={updateMeetingStatusAction}>
                        <input
                          type="hidden"
                          name="meetingId"
                          value={meeting.id}
                        />
                        <input type="hidden" name="status" value="completed" />

                        <button
                          type="submit"
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Concluir
                        </button>
                      </form>

                      <form action={updateMeetingStatusAction}>
                        <input
                          type="hidden"
                          name="meetingId"
                          value={meeting.id}
                        />
                        <input type="hidden" name="status" value="canceled" />

                        <button
                          type="submit"
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                        >
                          Cancelar
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}