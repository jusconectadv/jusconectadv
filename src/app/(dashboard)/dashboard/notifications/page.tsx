import Link from "next/link";

import {
  listLawyerNotifications,
  type LawyerNotificationPriority,
  type LawyerNotificationType,
} from "@/src/services/lawyer-notifications";

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

function formatDate(value: string | null): string {
  if (!value) {
    return "Sem prazo";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "Data inválida";
  }

  return `${day}/${month}/${year}`;
}

function getTypeLabel(type: LawyerNotificationType): string {
  const labels: Record<LawyerNotificationType, string> = {
    new_client: "Novo cliente",
    new_case: "Novo caso",
    client_message: "Mensagem",
    client_document: "Documento",
    task_overdue: "Tarefa atrasada",
    task_due_today: "Vence hoje",
    waiting_client: "Aguardando cliente",
    meeting_requested: "Reunião solicitada",
    meeting_today: "Reunião hoje",
  };

  return labels[type];
}

function getTypeClassName(type: LawyerNotificationType): string {
  const classes: Record<LawyerNotificationType, string> = {
    new_client: "border-emerald-200 bg-emerald-50 text-emerald-700",
    new_case: "border-blue-200 bg-blue-50 text-blue-700",
    client_message: "border-cyan-200 bg-cyan-50 text-cyan-700",
    client_document: "border-purple-200 bg-purple-50 text-purple-700",
    task_overdue: "border-red-200 bg-red-50 text-red-700",
    task_due_today: "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]",
    waiting_client: "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]",
    meeting_requested: "border-indigo-200 bg-indigo-50 text-indigo-700",
    meeting_today: "border-red-200 bg-red-50 text-red-700",
  };

  return classes[type];
}

function getPriorityLabel(priority: LawyerNotificationPriority): string {
  const labels: Record<LawyerNotificationPriority, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
  };

  return labels[priority];
}

function getPriorityClassName(priority: LawyerNotificationPriority): string {
  const classes: Record<LawyerNotificationPriority, string> = {
    low: "border-emerald-200 bg-emerald-50 text-emerald-700",
    medium: "border-blue-200 bg-blue-50 text-blue-700",
    high: "border-orange-200 bg-orange-50 text-orange-700",
    urgent: "border-red-200 bg-red-50 text-red-700",
  };

  return classes[priority];
}

function limitText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function getOperationalStatus(params: {
  urgent: number;
  overdueTasks: number;
  dueTodayTasks: number;
  meetingsToday: number;
}) {
  if (params.urgent > 0 || params.overdueTasks > 0) {
    return {
      label: "Atenção necessária",
      description:
        "Existem notificações urgentes, tarefas atrasadas ou reuniões para hoje.",
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (params.dueTodayTasks > 0 || params.meetingsToday > 0) {
    return {
      label: "Pendências para hoje",
      description: "Há prazos ou reuniões acontecendo hoje no escritório.",
      className: "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]",
    };
  }

  return {
    label: "Fluxo controlado",
    description: "Nenhuma pendência crítica identificada no momento.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
}

export default async function NotificationsPage() {
  const data = await listLawyerNotifications();

  const operationalStatus = getOperationalStatus({
    urgent: data.summary.urgent,
    overdueTasks: data.summary.overdue_tasks,
    dueTodayTasks: data.summary.due_today_tasks,
    meetingsToday: data.summary.meetings_today,
  });

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Central operacional
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Notificações
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Veja novos clientes, novos casos, mensagens, documentos, prazos,
              reuniões e pendências importantes geradas automaticamente pelo
              sistema.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Visão geral
              </Link>

              <Link
                href="/dashboard/meetings"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Ver agenda
              </Link>

              <Link
                href="/dashboard/activity"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Ver atividades
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Status da operação
              </p>

              <div className="mt-5">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${operationalStatus.className}`}
                >
                  {operationalStatus.label}
                </span>

                <p className="mt-3 text-sm leading-6 text-[#D8DEE5]">
                  {operationalStatus.description}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Total</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {data.summary.total}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Urgentes</p>
                  <p className="mt-1 text-2xl font-bold text-red-300">
                    {data.summary.urgent}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Reuniões hoje</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {data.summary.meetings_today}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Solicitações</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {data.summary.meeting_requests}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">Total</p>
          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {data.summary.total}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">
            Notificações encontradas
          </p>
        </div>

        <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-700">Urgentes</p>
          <strong className="mt-2 block text-3xl font-bold text-red-700">
            {data.summary.urgent}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">
            Exigem atenção imediata
          </p>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-indigo-700">
            Reuniões solicitadas
          </p>
          <strong className="mt-2 block text-3xl font-bold text-indigo-700">
            {data.summary.meeting_requests}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">
            Pedidos enviados pelo cliente
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#9E762D]">
            Reuniões hoje
          </p>
          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {data.summary.meetings_today}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">
            Compromissos do dia
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">
            Novos clientes
          </p>
          <strong className="mt-2 block text-3xl font-bold text-emerald-700">
            {data.summary.new_clients}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Cadastros recentes</p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Novos casos</p>
          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {data.summary.new_cases}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Atendimentos recentes</p>
        </div>

        <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-cyan-700">
            Mensagens cliente
          </p>
          <strong className="mt-2 block text-3xl font-bold text-cyan-700">
            {data.summary.client_messages}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Novas comunicações</p>
        </div>

        <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-purple-700">
            Documentos cliente
          </p>
          <strong className="mt-2 block text-3xl font-bold text-purple-700">
            {data.summary.client_documents}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Arquivos recebidos</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-700">
            Tarefas atrasadas
          </p>
          <strong className="mt-2 block text-3xl font-bold text-red-700">
            {data.summary.overdue_tasks}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Fora do prazo</p>
        </div>

        <div className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#9E762D]">Vencem hoje</p>
          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {data.summary.due_today_tasks}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Pendências do dia</p>
        </div>

        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">
            Aguardando cliente
          </p>
          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {data.summary.waiting_client_cases}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">
            Casos parados no retorno
          </p>
        </div>

        <Link
          href="/dashboard/meetings"
          className="rounded-3xl border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/70 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-[#9E762D]">Agenda</p>
          <strong className="mt-2 block text-base font-bold text-[#0B1D2D]">
            Abrir reuniões
          </strong>
          <p className="mt-2 text-xs text-[#7A5B24]">
            Solicitações e compromissos
          </p>
        </Link>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Lista operacional
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Notificações recentes
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              {data.notifications.length} notificação(ões) encontrada(s).
            </p>
          </div>
        </div>

        {data.notifications.length === 0 ? (
          <div className="p-8">
            <div className="rounded-3xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-8 text-center">
              <p className="text-sm font-bold text-[#0B1D2D]">
                Nenhuma notificação no momento.
              </p>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#5B6472]">
                Novos clientes, casos, mensagens, documentos, reuniões e prazos
                críticos aparecerão aqui.
              </p>

              <Link
                href="/dashboard"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Voltar ao dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#ECE7DD]">
            {data.notifications.map((notification) => (
              <article
                key={notification.id}
                className="p-5 transition hover:bg-[#F8F6F1]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getTypeClassName(
                          notification.type,
                        )}`}
                      >
                        {getTypeLabel(notification.type)}
                      </span>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getPriorityClassName(
                          notification.priority,
                        )}`}
                      >
                        {getPriorityLabel(notification.priority)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-[#0B1D2D]">
                      {notification.title}
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5B6472]">
                      {limitText(notification.description, 220)}
                    </p>

                    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Caso
                        </dt>

                        <dd className="mt-1 text-[#0B1D2D]">
                          {notification.case_title}
                        </dd>
                      </div>

                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Cliente
                        </dt>

                        <dd className="mt-1 text-[#0B1D2D]">
                          {notification.client_name ?? "Não informado"}
                        </dd>
                      </div>

                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Criado em
                        </dt>

                        <dd className="mt-1 font-bold text-[#0B1D2D]">
                          {formatDateTime(notification.created_at)}
                        </dd>
                      </div>

                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Prazo/data
                        </dt>

                        <dd className="mt-1 font-bold text-[#0B1D2D]">
                          {formatDate(notification.due_date)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <Link
                    href={notification.href}
                    className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                  >
                    Abrir registro
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}