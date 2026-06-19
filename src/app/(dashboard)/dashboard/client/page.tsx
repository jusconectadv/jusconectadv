import Link from "next/link";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { getClientDashboardData } from "@/src/services/client-dashboard";
import {
  listClientMeetings,
  type MeetingLocationType,
  type MeetingStatus,
} from "@/src/services/meetings";

function formatDate(date: string | null): string {
  if (!date) {
    return "Sem data";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR").format(parsedDate);
}

function formatDateTime(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
}

function isClosedStatus(status: string): boolean {
  return status === "resolved" || status === "closed";
}

function isWaitingClientStatus(status: string): boolean {
  return status === "waiting_client";
}

function limitText(
  value: string | null,
  maxLength: number,
): string {
  if (!value) {
    return "Sem descrição.";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function formatFileSize(size: number | null): string {
  if (!size || size <= 0) {
    return "Tamanho não informado";
  }

  const sizeInKb = size / 1024;

  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(1)} KB`;
  }

  return `${(sizeInKb / 1024).toFixed(2)} MB`;
}

function getDocumentSenderLabel(senderType: string): string {
  if (senderType === "lawyer") {
    return "Enviado pelo escritório";
  }

  if (senderType === "client") {
    return "Enviado por você";
  }

  return "Documento do atendimento";
}

function getMeetingStatusLabel(status: MeetingStatus): string {
  const labels: Record<MeetingStatus, string> = {
    requested: "Solicitada",
    scheduled: "Agendada",
    completed: "Concluída",
    canceled: "Cancelada",
  };

  return labels[status];
}

function getMeetingLocationLabel(
  locationType: MeetingLocationType,
): string {
  const labels: Record<MeetingLocationType, string> = {
    online: "Online",
    presential: "Presencial",
    phone: "Telefone",
  };

  return labels[locationType];
}

export default async function ClientDashboardPage() {
  const [dashboardData, meetingsData] = await Promise.all([
    getClientDashboardData(),
    listClientMeetings(),
  ]);

  const {
    client,
    cases,
    latestLawyerMessage,
    latestDocument,
  } = dashboardData;

  if (!client) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="overflow-hidden rounded-[2rem] border border-red-200 bg-red-50 shadow-sm">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-red-700">
              Portal do cliente
            </p>

            <h1 className="mt-3 text-3xl font-bold text-red-950">
              Cadastro não encontrado
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-red-800">
              Não encontramos um cadastro de cliente vinculado
              ao seu usuário. Verifique se você entrou com o
              mesmo e-mail usado no atendimento.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const activeCases = cases.filter(
    (legalCase) => !isClosedStatus(legalCase.status),
  );

  const waitingClientCases = cases.filter((legalCase) =>
    isWaitingClientStatus(legalCase.status),
  );

  const recentCases = cases.slice(0, 3);

  const priorityCase =
    waitingClientCases[0] ??
    (latestLawyerMessage
      ? cases.find(
          (legalCase) =>
            legalCase.id === latestLawyerMessage.case_id,
        )
      : null) ??
    activeCases[0] ??
    recentCases[0] ??
    null;

  const now = new Date();

  const nextMeeting =
    meetingsData.meetings.find((meeting) => {
      const meetingDate = new Date(meeting.meeting_at);

      return (
        meetingDate >= now &&
        meeting.status !== "completed" &&
        meeting.status !== "canceled"
      );
    }) ?? null;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid xl:grid-cols-[1.35fr_0.65fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Área do cliente
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Olá, {client.name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#B8C2CC]">
              Este é o seu espaço para solicitar atendimento,
              acompanhar atualizações, enviar informações e falar
              com o escritório.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/client/services"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Solicitar atendimento
              </Link>

              <Link
                href="/dashboard/client/cases"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Acompanhar solicitações
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
              Sua situação agora
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-[#0B1D2D] p-4">
                <p className="text-[11px] text-[#8FA0AE]">
                  Atendimentos ativos
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {activeCases.length}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0B1D2D] p-4">
                <p className="text-[11px] text-[#8FA0AE]">
                  Aguardando sua resposta
                </p>

                <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                  {waitingClientCases.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {waitingClientCases.length > 0 ? (
        <section className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm md:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
                Atenção necessária
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#0B1D2D]">
                O escritório está aguardando você
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
                Você possui {waitingClientCases.length}{" "}
                atendimento(s) aguardando uma mensagem,
                informação ou documento.
              </p>
            </div>

            <Link
              href="/dashboard/client/cases?status=waiting_client"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Ver o que está pendente
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Tudo certo
          </p>

          <h2 className="mt-2 text-xl font-bold text-emerald-950">
            Nenhuma resposta pendente
          </h2>

          <p className="mt-2 text-sm leading-6 text-emerald-800">
            Neste momento, o escritório não está aguardando
            nenhuma ação sua.
          </p>
        </section>
      )}

      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
            O que você deseja fazer?
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#0B1D2D]">
            Acesso rápido
          </h2>

          <p className="mt-2 text-sm text-[#5B6472]">
            Escolha uma opção para continuar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/dashboard/client/services"
            className="group rounded-3xl border border-[#E7D7B5] bg-[#FFF8E8] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#C89B4A] hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C89B4A] text-xl">
              ⚖️
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#0B1D2D]">
              Preciso de atendimento
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
              Escolha o assunto e conte o que aconteceu de
              forma simples.
            </p>

            <span className="mt-5 inline-flex text-sm font-bold text-[#9E762D]">
              Ver serviços →
            </span>
          </Link>

          <Link
            href="/dashboard/client/cases"
            className="group rounded-3xl border border-[#D8D2C7] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#C89B4A] hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2EFEA] text-xl">
              📂
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#0B1D2D]">
              Acompanhar atendimento
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#5B6472]">
              Veja o andamento, as mensagens e os documentos dos
              seus casos.
            </p>

            <span className="mt-5 inline-flex text-sm font-bold text-[#9E762D]">
              Acompanhar →
            </span>
          </Link>

          <Link
            href="/dashboard/client/meetings"
            className="group rounded-3xl border border-[#D8D2C7] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#C89B4A] hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2EFEA] text-xl">
              📅
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#0B1D2D]">
              Solicitar reunião
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#5B6472]">
              Solicite um horário e acompanhe suas reuniões com
              o escritório.
            </p>

            <span className="mt-5 inline-flex text-sm font-bold text-[#9E762D]">
              Ver reuniões →
            </span>
          </Link>

          <Link
            href={
              priorityCase
                ? `/dashboard/client/cases/${priorityCase.id}`
                : "/dashboard/client/services"
            }
            className="group rounded-3xl border border-[#D8D2C7] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#C89B4A] hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2EFEA] text-xl">
              💬
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#0B1D2D]">
              Falar com o escritório
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#5B6472]">
              Abra o atendimento mais importante para enviar uma
              mensagem.
            </p>

            <span className="mt-5 inline-flex text-sm font-bold text-[#9E762D]">
              Abrir conversa →
            </span>
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="overflow-hidden rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] shadow-sm">
          <div className="border-b border-[#E7D7B5] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Mensagem recente
            </p>

            <h2 className="mt-2 text-lg font-bold text-[#0B1D2D]">
              Última mensagem do escritório
            </h2>
          </div>

          <div className="p-5">
            {latestLawyerMessage ? (
              <>
                <p className="text-sm font-bold text-[#0B1D2D]">
                  {latestLawyerMessage.case_title}
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#7A5B24]">
                  “
                  {limitText(
                    latestLawyerMessage.content,
                    180,
                  )}
                  ”
                </p>

                <p className="mt-3 text-xs text-[#9E762D]">
                  {formatDateTime(
                    latestLawyerMessage.created_at,
                  )}
                </p>

                <Link
                  href={`/dashboard/client/cases/${latestLawyerMessage.case_id}`}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
                >
                  Responder agora
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-[#7A5B24]">
                  O escritório ainda não enviou mensagens para os
                  seus atendimentos.
                </p>

                <Link
                  href="/dashboard/client/cases"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-[#E7D7B5] bg-white px-4 py-3 text-sm font-bold text-[#0B1D2D] transition hover:border-[#C89B4A]"
                >
                  Ver atendimentos
                </Link>
              </>
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Documento recente
            </p>

            <h2 className="mt-2 text-lg font-bold text-[#0B1D2D]">
              Último arquivo do atendimento
            </h2>
          </div>

          <div className="p-5">
            {latestDocument ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2EFEA] text-xl">
                  📄
                </div>

                <p className="mt-4 break-all text-sm font-bold text-[#0B1D2D]">
                  {latestDocument.file_name}
                </p>

                <p className="mt-2 text-sm text-[#5B6472]">
                  {latestDocument.case_title}
                </p>

                <p className="mt-1 text-xs text-[#8FA0AE]">
                  {getDocumentSenderLabel(
                    latestDocument.sender_type,
                  )}
                  {" • "}
                  {formatFileSize(latestDocument.file_size)}
                </p>

                <p className="mt-2 text-xs text-[#8FA0AE]">
                  {formatDateTime(latestDocument.created_at)}
                </p>

                <Link
                  href={`/dashboard/client/cases/${latestDocument.case_id}`}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#0B1D2D] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
                >
                  Abrir atendimento
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-[#5B6472]">
                  Nenhum documento foi enviado nos seus
                  atendimentos até o momento.
                </p>

                <Link
                  href="/dashboard/client/cases"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm font-bold text-[#0B1D2D] transition hover:border-[#C89B4A]"
                >
                  Ver atendimentos
                </Link>
              </>
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-[1.75rem] border border-blue-200 bg-blue-50 shadow-sm">
          <div className="border-b border-blue-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              Próxima reunião
            </p>

            <h2 className="mt-2 text-lg font-bold text-[#0B1D2D]">
              Agenda com o escritório
            </h2>
          </div>

          <div className="p-5">
            {nextMeeting ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700">
                    {getMeetingStatusLabel(nextMeeting.status)}
                  </span>

                  <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700">
                    {getMeetingLocationLabel(
                      nextMeeting.location_type,
                    )}
                  </span>
                </div>

                <p className="mt-4 text-sm font-bold text-[#0B1D2D]">
                  {nextMeeting.title}
                </p>

                <p className="mt-2 text-sm leading-6 text-blue-800">
                  {formatDateTime(nextMeeting.meeting_at)}
                </p>

                <p className="mt-1 text-xs text-blue-700">
                  Duração prevista:{" "}
                  {nextMeeting.duration_minutes} minutos
                </p>

                {nextMeeting.case_title ? (
                  <p className="mt-3 text-sm text-blue-800">
                    Atendimento:{" "}
                    <strong>{nextMeeting.case_title}</strong>
                  </p>
                ) : null}

                <Link
                  href="/dashboard/client/meetings"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  Ver reunião
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-blue-800">
                  Você não possui reuniões futuras agendadas ou
                  solicitadas.
                </p>

                <Link
                  href="/dashboard/client/meetings"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  Solicitar reunião
                </Link>
              </>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Atualizações recentes
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Últimos atendimentos
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Mostramos aqui somente os atendimentos mais
                recentes.
              </p>
            </div>

            <Link
              href="/dashboard/client/cases"
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Ver todos
            </Link>
          </div>

          {recentCases.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F2EFEA] text-2xl">
                📭
              </div>

              <h3 className="mt-5 font-bold text-[#0B1D2D]">
                Nenhum atendimento ainda
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5B6472]">
                Escolha um serviço para enviar sua primeira
                solicitação.
              </p>

              <Link
                href="/dashboard/client/services"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Ver serviços
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {recentCases.map((legalCase) => (
                <article
                  key={legalCase.id}
                  className="p-5 md:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <CaseStatusBadge
                          status={legalCase.status}
                        />

                        <CasePriorityBadge
                          priority={legalCase.priority}
                        />
                      </div>

                      <h3 className="mt-3 text-base font-bold text-[#0B1D2D]">
                        {legalCase.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5B6472]">
                        {limitText(
                          legalCase.description,
                          135,
                        )}
                      </p>

                      <p className="mt-3 text-xs text-[#8FA0AE]">
                        Criado em{" "}
                        {formatDate(legalCase.created_at)}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/client/cases/${legalCase.id}`}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0B1D2D] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#132D44]"
                    >
                      Abrir
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-[#D8D2C7] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Como funciona
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#0B1D2D]">
              Use o portal em 3 passos
            </h2>

            <div className="mt-5 space-y-5">
              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B1D2D] text-sm font-bold text-white">
                  1
                </span>

                <div>
                  <h3 className="font-bold text-[#0B1D2D]">
                    Escolha o serviço
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#5B6472]">
                    Selecione o assunto que mais se aproxima da
                    sua necessidade.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B1D2D] text-sm font-bold text-white">
                  2
                </span>

                <div>
                  <h3 className="font-bold text-[#0B1D2D]">
                    Conte o que aconteceu
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#5B6472]">
                    Preencha as perguntas e envie documentos
                    quando possuir.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B1D2D] text-sm font-bold text-white">
                  3
                </span>

                <div>
                  <h3 className="font-bold text-[#0B1D2D]">
                    Acompanhe online
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#5B6472]">
                    Converse com o escritório e acompanhe o
                    andamento.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Não encontrou o que precisa?
            </p>

            <h2 className="mt-2 text-lg font-bold text-[#0B1D2D]">
              Conte sua situação
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
              Escolha a opção de atendimento geral e o
              escritório fará o direcionamento correto.
            </p>

            <Link
              href="/dashboard/client/cases/new?service=outros"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Falar com o escritório
            </Link>
          </section>
        </aside>
      </section>
    </section>
  );
}