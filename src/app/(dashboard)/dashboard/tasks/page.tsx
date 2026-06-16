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
    overdue: "border-red-200 bg-red-50 text-red-700",
    today: "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]",
    next_7_days: "border-blue-200 bg-blue-50 text-blue-700",
    no_due_date: "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]",
    future: "border-emerald-200 bg-emerald-50 text-emerald-700",
    done: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return classes[group] ?? "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
}

function getStatusLabel(status: string): string {
  if (status === "done") {
    return "Concluída";
  }

  return "Pendente";
}

function getStatusClassName(status: string): string {
  if (status === "done") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]";
}

function limitText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export default async function LawyerTasksPage() {
  const { summary, tasks } = await listLawyerTasks();

  const pendingTasks = tasks.filter((item) => item.task.status !== "done");
  const doneTasks = tasks.filter((item) => item.task.status === "done");

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Prazos e operação
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Tarefas e pendências
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Acompanhe tarefas atrasadas, prazos do dia e próximas pendências
              dos casos ativos do escritório. Use esta tela como central de
              acompanhamento operacional.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/cases"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Ver casos
              </Link>

              <Link
                href="/dashboard/cases/kanban"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Ver Kanban
              </Link>

              <Link
                href="/dashboard/search"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Buscar dados
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Resumo de prazos
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Pendentes</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {summary.total_pending}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Atrasadas</p>
                  <p className="mt-1 text-2xl font-bold text-red-300">
                    {summary.overdue}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Hoje</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {summary.due_today}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">7 dias</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {summary.next_7_days}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">
            Total pendentes
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {summary.total_pending}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Tarefas ainda abertas
          </p>
        </div>

        <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-700">Atrasadas</p>

          <strong className="mt-2 block text-3xl font-bold text-red-700">
            {summary.overdue}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Precisam de atenção imediata
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#9E762D]">Vencem hoje</p>

          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {summary.due_today}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Pendências do dia
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">
            Próximos 7 dias
          </p>

          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {summary.next_7_days}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Prazos próximos
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Pendências
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Tarefas abertas
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Tarefas ainda não concluídas, ordenadas por urgência e prazo.
            </p>
          </div>

          <span className="rounded-full border border-[#D8D2C7] bg-white px-3 py-1 text-xs font-bold text-[#0B1D2D]">
            {pendingTasks.length} aberta(s)
          </span>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="p-8">
            <div className="rounded-3xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-8 text-center">
              <p className="text-sm font-bold text-[#0B1D2D]">
                Nenhuma pendência aberta.
              </p>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#5B6472]">
                Quando novas tarefas forem criadas nos casos, elas aparecerão
                aqui.
              </p>

              <Link
                href="/dashboard/cases"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Abrir casos
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#ECE7DD]">
            {pendingTasks.map((item) => (
              <article
                key={item.task.id}
                className="p-5 transition hover:bg-[#F8F6F1]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getDueGroupClassName(
                          item.due_group,
                        )}`}
                      >
                        {getDueGroupLabel(item.due_group)}
                      </span>

                      <CasePriorityBadge priority={item.task.priority} />

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClassName(
                          item.task.status,
                        )}`}
                      >
                        {getStatusLabel(item.task.status)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-[#0B1D2D]">
                      {item.task.title}
                    </h3>

                    {item.task.description ? (
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#5B6472]">
                        {limitText(item.task.description, 260)}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-[#8FA0AE]">
                        Sem descrição informada.
                      </p>
                    )}

                    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Prazo
                        </dt>

                        <dd className="mt-1 font-bold text-[#0B1D2D]">
                          {formatDate(item.task.due_date)}
                        </dd>
                      </div>

                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Caso
                        </dt>

                        <dd className="mt-1 text-[#0B1D2D]">
                          {item.case_title}
                        </dd>
                      </div>

                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Cliente
                        </dt>

                        <dd className="mt-1 text-[#0B1D2D]">
                          {item.client_name ?? "Cliente não informado"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link
                      href={`/dashboard/cases/${item.case_id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
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
                        className="inline-flex items-center justify-center rounded-xl bg-[#0B1D2D] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#132D44]"
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

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Histórico
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Tarefas concluídas
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Histórico recente de tarefas finalizadas.
            </p>
          </div>

          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {doneTasks.length} concluída(s)
          </span>
        </div>

        {doneTasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#5B6472]">
            Nenhuma tarefa concluída até o momento.
          </div>
        ) : (
          <div className="divide-y divide-[#ECE7DD]">
            {doneTasks.map((item) => (
              <article
                key={item.task.id}
                className="p-5 transition hover:bg-[#F8F6F1]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getDueGroupClassName(
                          item.due_group,
                        )}`}
                      >
                        {getDueGroupLabel(item.due_group)}
                      </span>

                      <CasePriorityBadge priority={item.task.priority} />

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClassName(
                          item.task.status,
                        )}`}
                      >
                        {getStatusLabel(item.task.status)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-[#0B1D2D]">
                      {item.task.title}
                    </h3>

                    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Prazo
                        </dt>

                        <dd className="mt-1 font-bold text-[#0B1D2D]">
                          {formatDate(item.task.due_date)}
                        </dd>
                      </div>

                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Caso
                        </dt>

                        <dd className="mt-1 text-[#0B1D2D]">
                          {item.case_title}
                        </dd>
                      </div>

                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Cliente
                        </dt>

                        <dd className="mt-1 text-[#0B1D2D]">
                          {item.client_name ?? "Cliente não informado"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link
                      href={`/dashboard/cases/${item.case_id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
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
                        className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
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
    </section>
  );
}