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

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default async function DashboardPage() {
  const overview = await getDashboardOverview();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Visão geral do escritório
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {overview.tenant_name}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Central operacional com casos, prazos, mensagens e documentos
              recentes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/advogado/${overview.tenant_id}`}
              target="_blank"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Link público
            </Link>

            <Link
              href="/dashboard/cases/new"
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Novo caso
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total de casos
            </p>

            <strong className="mt-2 block text-3xl font-semibold text-slate-950">
              {overview.summary.total_cases}
            </strong>

            <p className="mt-2 text-xs text-slate-500">
              Base completa do escritório
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-600">Novos</p>

            <strong className="mt-2 block text-3xl font-semibold text-blue-700">
              {overview.summary.new_cases}
            </strong>

            <p className="mt-2 text-xs text-slate-500">
              Aguardando primeira análise
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">
              Em andamento
            </p>

            <strong className="mt-2 block text-3xl font-semibold text-emerald-700">
              {overview.summary.in_progress_cases}
            </strong>

            <p className="mt-2 text-xs text-slate-500">
              Casos sendo trabalhados
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-600">
              Aguardando cliente
            </p>

            <strong className="mt-2 block text-3xl font-semibold text-amber-700">
              {overview.summary.waiting_client_cases}
            </strong>

            <p className="mt-2 text-xs text-slate-500">
              Pendentes de retorno externo
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/tasks"
            className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-red-600">
              Tarefas atrasadas
            </p>

            <strong className="mt-2 block text-3xl font-semibold text-red-700">
              {overview.summary.overdue_tasks}
            </strong>

            <p className="mt-2 text-sm text-slate-500">
              Clique para revisar prazos críticos.
            </p>
          </Link>

          <Link
            href="/dashboard/tasks"
            className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-amber-600">Vencem hoje</p>

            <strong className="mt-2 block text-3xl font-semibold text-amber-700">
              {overview.summary.due_today_tasks}
            </strong>

            <p className="mt-2 text-sm text-slate-500">
              Pendências que precisam de atenção hoje.
            </p>
          </Link>

          <Link
            href="/dashboard/tasks"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-600">
              Tarefas pendentes
            </p>

            <strong className="mt-2 block text-3xl font-semibold text-slate-950">
              {overview.summary.pending_tasks}
            </strong>

            <p className="mt-2 text-sm text-slate-500">
              Todas as tarefas abertas do escritório.
            </p>
          </Link>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Casos recentes
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Últimos atendimentos registrados.
                </p>
              </div>

              <Link
                href="/dashboard/cases"
                className="text-sm font-medium text-slate-700 hover:text-slate-950"
              >
                Ver todos
              </Link>
            </div>

            {overview.latest_cases.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Nenhum caso cadastrado ainda.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overview.latest_cases.map((caseItem) => (
                  <article key={caseItem.id} className="p-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <CaseStatusBadge status={caseItem.status} />
                        <CasePriorityBadge priority={caseItem.priority} />
                      </div>

                      <Link
                        href={`/dashboard/cases/${caseItem.id}`}
                        className="font-semibold text-slate-950 hover:text-slate-700"
                      >
                        {caseItem.title}
                      </Link>

                      <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                        {caseItem.description
                          ? limitText(caseItem.description, 120)
                          : "Sem descrição informada."}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>
                          Cliente:{" "}
                          {caseItem.client_name ?? "Cliente não informado"}
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

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Prazos e tarefas críticas
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Tarefas abertas ordenadas por urgência.
                </p>
              </div>

              <Link
                href="/dashboard/tasks"
                className="text-sm font-medium text-slate-700 hover:text-slate-950"
              >
                Ver tarefas
              </Link>
            </div>

            {overview.urgent_tasks.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Nenhuma tarefa pendente no momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overview.urgent_tasks.map((task) => (
                  <article key={task.id} className="p-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getTaskDueClassName(
                            task,
                          )}`}
                        >
                          {getTaskDueLabel(task)}
                        </span>

                        <CasePriorityBadge priority={task.priority} />
                      </div>

                      <Link
                        href={`/dashboard/cases/${task.case_id}`}
                        className="font-semibold text-slate-950 hover:text-slate-700"
                      >
                        {task.title}
                      </Link>

                      <div className="text-sm leading-6 text-slate-600">
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
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Mensagens recentes
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Últimas conversas registradas nos casos.
                </p>
              </div>

              <Link
                href="/dashboard/activity"
                className="text-sm font-medium text-slate-700 hover:text-slate-950"
              >
                Ver atividades
              </Link>
            </div>

            {overview.latest_messages.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Nenhuma mensagem recente.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overview.latest_messages.map((message) => (
                  <article key={message.id} className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                          {getSenderLabel(message.sender_type)}
                        </span>

                        <span>{formatDateTime(message.created_at)}</span>
                      </div>

                      <Link
                        href={`/dashboard/cases/${message.case_id}`}
                        className="font-semibold text-slate-950 hover:text-slate-700"
                      >
                        {message.case_title}
                      </Link>

                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                        {limitText(message.content, 160)}
                      </p>

                      <p className="text-xs text-slate-500">
                        Cliente: {message.client_name ?? "Cliente não informado"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Documentos recentes
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Arquivos enviados pelo cliente ou escritório.
                </p>
              </div>

              <Link
                href="/dashboard/activity"
                className="text-sm font-medium text-slate-700 hover:text-slate-950"
              >
                Ver atividades
              </Link>
            </div>

            {overview.latest_documents.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Nenhum documento recente.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overview.latest_documents.map((document) => (
                  <article key={document.id} className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 font-medium text-purple-700">
                          {getSenderLabel(document.sender_type)}
                        </span>

                        <span>{formatDateTime(document.created_at)}</span>
                      </div>

                      <Link
                        href={`/dashboard/cases/${document.case_id}`}
                        className="font-semibold text-slate-950 hover:text-slate-700"
                      >
                        {document.file_name}
                      </Link>

                      <p className="text-sm leading-6 text-slate-600">
                        Caso: {document.case_title}
                      </p>

                      <p className="text-xs text-slate-500">
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
            className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md"
          >
            Ver lista de casos
          </Link>

          <Link
            href="/dashboard/cases/kanban"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md"
          >
            Abrir Kanban
          </Link>

          <Link
            href="/dashboard/search"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md"
          >
            Buscar no escritório
          </Link>

          <Link
            href="/dashboard/clients"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md"
          >
            Ver clientes
          </Link>
        </section>
      </div>
    </main>
  );
}