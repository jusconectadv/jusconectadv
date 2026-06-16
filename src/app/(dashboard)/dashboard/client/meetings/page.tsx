import Link from "next/link";

import {
  listClientMeetings,
  requestClientMeetingAction,
  type MeetingLocationType,
  type MeetingStatus,
} from "@/src/services/meetings";

type ClientMeetingsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    caseId?: string;
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
  if (success === "meeting-requested") {
    return "Solicitação de reunião enviada com sucesso.";
  }

  return null;
}

export default async function ClientMeetingsPage({
  searchParams,
}: ClientMeetingsPageProps) {
  const query = await searchParams;
  const data = await listClientMeetings();
  const successMessage = getSuccessMessage(query.success);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <Link
              href="/dashboard/client"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para meus atendimentos
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Agenda do cliente
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Minhas reuniões
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Solicite uma reunião com o escritório e acompanhe os encontros
              vinculados aos seus atendimentos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/client/cases/new"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Novo atendimento
              </Link>

              <Link
                href="/dashboard/client"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Meus atendimentos
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
      </header>

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
              Solicitar horário
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Nova solicitação de reunião
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#5B6472]">
              Escolha o atendimento, informe a melhor data e envie sua
              solicitação ao escritório.
            </p>
          </div>

          {data.cases.length === 0 ? (
            <div className="p-5">
              <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-5 text-sm leading-6 text-[#5B6472]">
                Você ainda não possui atendimentos ativos para solicitar uma
                reunião.

                <div className="mt-4">
                  <Link
                    href="/dashboard/client/cases/new"
                    className="inline-flex rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
                  >
                    Abrir novo atendimento
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form action={requestClientMeetingAction} className="space-y-4 p-5">
              <div>
                <label className="text-sm font-bold text-[#0B1D2D]">
                  Atendimento
                </label>

                <select
                  name="caseId"
                  required
                  defaultValue={query.caseId ?? ""}
                  className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                >
                  <option value="">Selecione o atendimento</option>

                  {data.cases.map((legalCase) => (
                    <option key={legalCase.id} value={legalCase.id}>
                      {legalCase.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-[#0B1D2D]">
                  Assunto
                </label>

                <input
                  name="title"
                  placeholder="Ex: Reunião para tirar dúvidas"
                  className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-[#0B1D2D]">
                    Melhor data e hora
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
                    Preferência
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
              </div>

              <input type="hidden" name="durationMinutes" value="60" />

              <div>
                <label className="text-sm font-bold text-[#0B1D2D]">
                  Observações
                </label>

                <textarea
                  name="description"
                  rows={4}
                  placeholder="Explique rapidamente o motivo da reunião..."
                  className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Solicitar reunião
              </button>
            </form>
          )}
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Histórico
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Reuniões solicitadas/agendadas
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#5B6472]">
              Aqui aparecem as reuniões solicitadas por você e as reuniões
              agendadas pelo escritório.
            </p>
          </div>

          {data.meetings.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#5B6472]">
              Nenhuma reunião solicitada ou agendada ainda.
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {data.meetings.map((meeting) => (
                <article key={meeting.id} className="p-5">
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

                  <p className="mt-1 text-sm leading-6 text-[#5B6472]">
                    Atendimento:{" "}
                    <strong className="text-[#0B1D2D]">
                      {meeting.case_title ?? "Sem atendimento vinculado"}
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

                  {meeting.case_id ? (
                    <div className="mt-4">
                      <Link
                        href={`/dashboard/client/cases/${meeting.case_id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                      >
                        Abrir atendimento
                      </Link>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}