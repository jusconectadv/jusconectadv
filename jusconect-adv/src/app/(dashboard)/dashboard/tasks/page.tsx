import Link from "next/link";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { updateCaseTaskStatusAction } from "@/src/services/case-tasks";
import { listLawyerTasks } from "@/src/services/lawyer-tasks";

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

function getDueGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    overdue: "Atrasada",
    today: "Vence hoje",
    next_7_days: "Próximos 7 dias",
    no_due_date: "Sem prazo",
    future: "Futura",
    done: "Concluída",
  };

  return labels[group] ?? "Pendente";
}

function getDueGroupClassName(group: string): string {
  const classes: Record<string, string> = {
    overdue: "bg-red-50 text-red-700 border-red-200",
    today: "bg-amber-50 text-amber-700 border-amber-200",
    next_7_days: "bg-blue-50 text-blue-700 border-blue-200",
    no_due_date: "bg-slate-50 text-slate-700 border-slate-200",
    future: "bg-emerald-50 text-emerald-700 border-emerald-200",
    done: "bg-zinc-50 text-zinc-600 border-zinc-200",
  };

  return classes[group] ?? "bg-slate-50 text-slate-700 border-slate-200";
}

function getStatusLabel(status: string): string {
  if (status === "done") {
    return "Concluída";
  }

  return "Pendente";
}

export default async function LawyerTasksPage() {
  const { summary, tasks } = await listLawyerTasks();

  const pendingTasks = tasks.filter((item) => item.task.status !== "done");
  const doneTasks = tasks.filter((item) => item.task.status === "done");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Painel do advogado
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Tarefas e pendências
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Acompanhe tarefas atrasadas, prazos do dia e próximas pendências
              dos casos ativos do escritório.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/cases"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Ver casos
            </Link>

            <Link
              href="/dashboard/cases/kanban"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Ver Kanban
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total pendentes
            </p>

            <strong className="mt-2 block text-3xl font-semibold text-slate-950">
              {summary.total_pending}
            </strong>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-red-600">Atrasadas</p>

            <strong className="mt-2 block text-3xl font-semibold text-red-700">
              {summary.overdue}
            </strong>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-600">Vencem hoje</p>

            <strong className="mt-2 block text-3xl font-semibold text-amber-700">
              {summary.due_today}
            </strong>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-600">
              Próximos 7 dias
            </p>

            <strong className="mt-2 block text-3xl font-semibold text-blue-700">
              {summary.next_7_days}
            </strong>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Pendências abertas
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Tarefas ainda não concluídas, ordenadas por urgência e prazo.
            </p>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                Nenhuma pendência aberta.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Quando novas tarefas forem criadas nos casos, elas aparecerão
                aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingTasks.map((item) => (
                <article key={item.task.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getDueGroupClassName(
                            item.due_group,
                          )}`}
                        >
                          {getDueGroupLabel(item.due_group)}
                        </span>

                        <CasePriorityBadge priority={item.task.priority} />

                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {getStatusLabel(item.task.status)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-slate-950">
                        {item.task.title}
                      </h3>

                      {item.task.description ? (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                          {item.task.description}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-slate-400">
                          Sem descrição informada.
                        </p>
                      )}

                      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                        <div>
                          <dt className="font-medium text-slate-500">Prazo</dt>
                          <dd className="mt-1 text-slate-800">
                            {formatDate(item.task.due_date)}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium text-slate-500">Caso</dt>
                          <dd className="mt-1 text-slate-800">
                            {item.case_title}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium text-slate-500">
                            Cliente
                          </dt>
                          <dd className="mt-1 text-slate-800">
                            {item.client_name ?? "Cliente não informado"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Link
                        href={`/dashboard/cases/${item.case_id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Abrir caso
                      </Link>

                      <form action={updateCaseTaskStatusAction}>
                        <input
                          type="hidden"
                          name="caseId"
                          value={item.case_id}
                        />

                        <input
                          type="hidden"
                          name="taskId"
                          value={item.task.id}
                        />

                        <input type="hidden" name="status" value="done" />

                        <input type="hidden" name="returnTo" value="tasks" />

                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          Concluir
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Tarefas concluídas
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Histórico recente de tarefas finalizadas.
            </p>
          </div>

          {doneTasks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">
                Nenhuma tarefa concluída até o momento.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {doneTasks.map((item) => (
                <article key={item.task.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getDueGroupClassName(
                            item.due_group,
                          )}`}
                        >
                          {getDueGroupLabel(item.due_group)}
                        </span>

                        <CasePriorityBadge priority={item.task.priority} />
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-slate-950">
                        {item.task.title}
                      </h3>

                      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                        <div>
                          <dt className="font-medium text-slate-500">Prazo</dt>
                          <dd className="mt-1 text-slate-800">
                            {formatDate(item.task.due_date)}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium text-slate-500">Caso</dt>
                          <dd className="mt-1 text-slate-800">
                            {item.case_title}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium text-slate-500">
                            Cliente
                          </dt>
                          <dd className="mt-1 text-slate-800">
                            {item.client_name ?? "Cliente não informado"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Link
                        href={`/dashboard/cases/${item.case_id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Abrir caso
                      </Link>

                      <form action={updateCaseTaskStatusAction}>
                        <input
                          type="hidden"
                          name="caseId"
                          value={item.case_id}
                        />

                        <input
                          type="hidden"
                          name="taskId"
                          value={item.task.id}
                        />

                        <input type="hidden" name="status" value="pending" />

                        <input type="hidden" name="returnTo" value="tasks" />

                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Reabrir
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}