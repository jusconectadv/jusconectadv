import Link from "next/link";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { getDashboardOverview } from "@/src/services/dashboard-overview";

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

function getTaskDueLabel(task: {
  due_date: string | null;
  is_overdue: boolean;
  is_due_today: boolean;
}): string {
  if (task.is_overdue) {
    return `Atrasada • ${formatDate(task.due_date)}`;
  }

  if (task.is_due_today) {
    return "Vence hoje";
  }

  return formatDate(task.due_date);
}

function getTaskDueClassName(task: {
  is_overdue: boolean;
  is_due_today: boolean;
}): string {
  if (task.is_overdue) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (task.is_due_today) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
}

function getHealthLabel(params: {
  overdueTasks: number;
  waitingClientCases: number;
  newCases: number;
}): {
  label: string;
  description: string;
  className: string;
} {
  if (params.overdueTasks > 0) {
    return {
      label: "Atenção necessária",
      description: "Existem prazos atrasados que precisam de prioridade.",
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (params.waitingClientCases > 0 || params.newCases > 0) {
    return {
      label: "Operação ativa",
      description: "Há casos aguardando análise ou retorno de clientes.",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Tudo em ordem",
    description: "Nenhum alerta crítico identificado neste momento.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
}

export default async function DashboardPage() {
  const overview = await getDashboardOverview();

  const health = getHealthLabel({
    overdueTasks: overview.summary.overdue_tasks,
    waitingClientCases: overview.summary.waiting_client_cases,
    newCases: overview.summary.new_cases,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Visão geral do escritório
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              {overview.tenant_name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Central operacional com clientes, casos, prazos, mensagens e
              documentos recentes. Acompanhe a saúde do escritório e acesse as
              principais rotinas em poucos cliques.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/advogado/${overview.tenant_id}`}
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Link público
              </Link>

              <Link
                href="/dashboard/clients/new"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Novo cliente
              </Link>

              <Link
                href="/dashboard/cases/new"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Novo caso
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 lg:border-l lg:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Status operacional
              </p>

              <div className="mt-4">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${health.className}`}
                >
                  {health.label}
                </span>

                <p className="mt-3 text-sm leading-6 text-[#D8DEE5]">
                  {health.description}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-3">
                  <p className="text-[11px] text-[#8FA0AE]">Casos</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {overview.summary.total_cases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-3">
                  <p className="text-[11px] text-[#8FA0AE]">Clientes</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {overview.summary.total_clients}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-3">
                  <p className="text-[11px] text-[#8FA0AE]">Prazos</p>
                  <p className="mt-1 text-xl font-bold text-[#C89B4A]">
                    {overview.summary.overdue_tasks}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <Link
          href="/dashboard/clients"
          className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-emerald-700">
            Clientes ativos
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {overview.summary.active_clients}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            {overview.summary.archived_clients} arquivado(s)
          </p>
        </Link>

        <Link
          href="/dashboard/clients?status=all"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/50 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-[#5B6472]">
            Total de clientes
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {overview.summary.total_clients}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">Ativos e arquivados</p>
        </Link>

        <Link
          href="/dashboard/cases"
          className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-blue-700">Total de casos</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {overview.summary.total_cases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Base completa do escritório
          </p>
        </Link>

        <Link
          href="/dashboard/tasks"
          className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-red-700">
            Tarefas atrasadas
          </p>

          <strong className="mt-2 block text-3xl font-bold text-red-700">
            {overview.summary.overdue_tasks}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">Prazos críticos</p>
        </Link>

        <Link
          href="/dashboard/tasks"
          className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A] hover:shadow-md"
        >
          <p className="text-sm font-semibold text-[#9E762D]">Vencem hoje</p>

          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {overview.summary.due_today_tasks}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">Pendências para hoje</p>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Link
          href="/dashboard/cases?status=new"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-blue-700">Novos</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {overview.summary.new_cases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Aguardando primeira análise
          </p>
        </Link>

        <Link
          href="/dashboard/cases?status=in_progress"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-emerald-700">
            Em andamento
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {overview.summary.in_progress_cases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Casos sendo trabalhados
          </p>
        </Link>

        <Link
          href="/dashboard/cases?status=waiting_client"
          className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A] hover:shadow-md"
        >
          <p className="text-sm font-semibold text-[#9E762D]">
            Aguardando cliente
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {overview.summary.waiting_client_cases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Pendentes de retorno externo
          </p>
        </Link>

        <Link
          href="/dashboard/cases?status=closed"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/50 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-[#5B6472]">Finalizados</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {overview.summary.closed_cases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Casos concluídos ou resolvidos
          </p>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/tasks"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/50 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-[#5B6472]">
            Tarefas pendentes
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {overview.summary.pending_tasks}
          </strong>

          <p className="mt-2 text-sm text-[#5B6472]">
            Todas as tarefas abertas do escritório.
          </p>
        </Link>

        <Link
          href="/dashboard/activity"
          className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-cyan-700">
            Mensagens recentes
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {overview.summary.recent_messages}
          </strong>

          <p className="mt-2 text-sm text-[#5B6472]">
            Últimas conversas registradas.
          </p>
        </Link>

        <Link
          href="/dashboard/activity"
          className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-purple-700">
            Documentos recentes
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {overview.summary.recent_documents}
          </strong>

          <p className="mt-2 text-sm text-[#5B6472]">
            Arquivos enviados recentemente.
          </p>
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Atendimento
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Casos recentes
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Últimos atendimentos registrados.
              </p>
            </div>

            <Link
              href="/dashboard/cases"
              className="rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Ver todos
            </Link>
          </div>

          {overview.latest_cases.length === 0 ? (
            <div className="p-6 text-sm text-[#5B6472]">
              Nenhum caso cadastrado ainda.
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {overview.latest_cases.map((caseItem) => (
                <article key={caseItem.id} className="p-5 transition hover:bg-[#F8F6F1]">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <CaseStatusBadge status={caseItem.status} />
                      <CasePriorityBadge priority={caseItem.priority} />
                    </div>

                    <Link
                      href={`/dashboard/cases/${caseItem.id}`}
                      className="font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                    >
                      {caseItem.title}
                    </Link>

                    <p className="line-clamp-2 text-sm leading-6 text-[#5B6472]">
                      {caseItem.description
                        ? limitText(caseItem.description, 120)
                        : "Sem descrição informada."}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B6472]">
                      <span>
                        Cliente: {caseItem.client_name ?? "Cliente não informado"}
                      </span>
                      <span>•</span>
                      <span>{formatDateTime(caseItem.created_at)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Prazos
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Tarefas críticas
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Tarefas abertas ordenadas por urgência.
              </p>
            </div>

            <Link
              href="/dashboard/tasks"
              className="rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Ver tarefas
            </Link>
          </div>

          {overview.urgent_tasks.length === 0 ? (
            <div className="p-6 text-sm text-[#5B6472]">
              Nenhuma tarefa pendente no momento.
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {overview.urgent_tasks.map((task) => (
                <article key={task.id} className="p-5 transition hover:bg-[#F8F6F1]">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getTaskDueClassName(
                          task,
                        )}`}
                      >
                        {getTaskDueLabel(task)}
                      </span>

                      <CasePriorityBadge priority={task.priority} />
                    </div>

                    <Link
                      href={`/dashboard/cases/${task.case_id}`}
                      className="font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                    >
                      {task.title}
                    </Link>

                    <div className="text-sm leading-6 text-[#5B6472]">
                      <p>Caso: {task.case_title}</p>
                      <p>
                        Cliente: {task.client_name ?? "Cliente não informado"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Comunicação
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Mensagens recentes
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Últimas conversas registradas nos casos.
              </p>
            </div>

            <Link
              href="/dashboard/activity"
              className="rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Ver atividades
            </Link>
          </div>

          {overview.latest_messages.length === 0 ? (
            <div className="p-6 text-sm text-[#5B6472]">
              Nenhuma mensagem recente.
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {overview.latest_messages.map((message) => (
                <article key={message.id} className="p-5 transition hover:bg-[#F8F6F1]">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B6472]">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                        {getSenderLabel(message.sender_type)}
                      </span>

                      <span>{formatDateTime(message.created_at)}</span>
                    </div>

                    <Link
                      href={`/dashboard/cases/${message.case_id}`}
                      className="font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                    >
                      {message.case_title}
                    </Link>

                    <p className="line-clamp-3 text-sm leading-6 text-[#5B6472]">
                      {limitText(message.content, 160)}
                    </p>

                    <p className="text-xs text-[#5B6472]">
                      Cliente: {message.client_name ?? "Cliente não informado"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Documentos
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Documentos recentes
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Arquivos enviados pelo cliente ou escritório.
              </p>
            </div>

            <Link
              href="/dashboard/activity"
              className="rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Ver atividades
            </Link>
          </div>

          {overview.latest_documents.length === 0 ? (
            <div className="p-6 text-sm text-[#5B6472]">
              Nenhum documento recente.
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {overview.latest_documents.map((document) => (
                <article key={document.id} className="p-5 transition hover:bg-[#F8F6F1]">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B6472]">
                      <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 font-semibold text-purple-700">
                        {getSenderLabel(document.sender_type)}
                      </span>

                      <span>{formatDateTime(document.created_at)}</span>
                    </div>

                    <Link
                      href={`/dashboard/cases/${document.case_id}`}
                      className="font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                    >
                      {document.file_name}
                    </Link>

                    <p className="text-sm leading-6 text-[#5B6472]">
                      Caso: {document.case_title}
                    </p>

                    <p className="text-xs text-[#5B6472]">
                      Cliente: {document.client_name ?? "Cliente não informado"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Link
          href="/dashboard/cases"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 text-sm font-bold text-[#0B1D2D] shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A] hover:text-[#9E762D] hover:shadow-md"
        >
          Ver lista de casos
        </Link>

        <Link
          href="/dashboard/cases/kanban"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 text-sm font-bold text-[#0B1D2D] shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A] hover:text-[#9E762D] hover:shadow-md"
        >
          Abrir Kanban
        </Link>

        <Link
          href="/dashboard/search"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 text-sm font-bold text-[#0B1D2D] shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A] hover:text-[#9E762D] hover:shadow-md"
        >
          Buscar no escritório
        </Link>

        <Link
          href="/dashboard/clients"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 text-sm font-bold text-[#0B1D2D] shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A] hover:text-[#9E762D] hover:shadow-md"
        >
          Ver clientes
        </Link>
      </section>
    </div>
  );
}