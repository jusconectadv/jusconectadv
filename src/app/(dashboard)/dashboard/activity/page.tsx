import Link from "next/link";

import {
  listLawyerActivities,
  type LawyerActivityType,
} from "@/src/services/lawyer-activity";

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

function getActivityLabel(type: LawyerActivityType): string {
  const labels: Record<LawyerActivityType, string> = {
    case_created: "Caso",
    message_created: "Mensagem",
    document_uploaded: "Documento",
    task_created: "Tarefa",
    note_created: "Nota",
  };

  return labels[type];
}

function getActivityClassName(type: LawyerActivityType): string {
  const classes: Record<LawyerActivityType, string> = {
    case_created: "border-blue-200 bg-blue-50 text-blue-700",
    message_created: "border-emerald-200 bg-emerald-50 text-emerald-700",
    document_uploaded: "border-purple-200 bg-purple-50 text-purple-700",
    task_created: "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]",
    note_created: "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]",
  };

  return classes[type];
}

export default async function DashboardActivityPage() {
  const { summary, activities } = await listLawyerActivities();

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Painel do advogado
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Atividades recentes
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Veja os últimos movimentos do escritório: casos, mensagens,
              documentos, tarefas e notas internas.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/search"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Busca global
              </Link>

              <Link
                href="/dashboard/tasks"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Ver tarefas
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Visão geral
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Resumo de movimentações
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Total</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {summary.total}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Casos</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {summary.cases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Mensagens</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {summary.messages}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Documentos</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {summary.documents}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">Total</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {summary.total}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Movimentações recentes
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Casos</p>

          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {summary.cases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Atendimentos criados
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">Mensagens</p>

          <strong className="mt-2 block text-3xl font-bold text-emerald-700">
            {summary.messages}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Conversas registradas
          </p>
        </div>

        <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-purple-700">Documentos</p>

          <strong className="mt-2 block text-3xl font-bold text-purple-700">
            {summary.documents}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Arquivos enviados
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#9E762D]">Tarefas</p>

          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {summary.tasks}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Pendências criadas
          </p>
        </div>

        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">Notas</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {summary.notes}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Registros internos
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
            Feed operacional
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
            Feed do escritório
          </h2>

          <p className="mt-1 text-sm text-[#5B6472]">
            Últimas atividades registradas nos casos do tenant atual.
          </p>
        </div>

        {activities.length === 0 ? (
          <div className="p-8">
            <div className="rounded-3xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-8 text-center">
              <p className="text-sm font-bold text-[#0B1D2D]">
                Nenhuma atividade encontrada.
              </p>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#5B6472]">
                Quando houver movimentações nos casos, elas aparecerão aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#ECE7DD]">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="p-5 transition hover:bg-[#F8F6F1]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getActivityClassName(
                          activity.type,
                        )}`}
                      >
                        {getActivityLabel(activity.type)}
                      </span>

                      <span className="text-xs font-semibold text-[#8FA0AE]">
                        {formatDateTime(activity.created_at)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-[#0B1D2D]">
                      {activity.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                      {activity.description}
                    </p>

                    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Caso
                        </dt>

                        <dd className="mt-1 text-[#0B1D2D]">
                          {activity.case_title}
                        </dd>
                      </div>

                      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                          Cliente
                        </dt>

                        <dd className="mt-1 text-[#0B1D2D]">
                          {activity.client_name ?? "Cliente não informado"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <Link
                    href={activity.href}
                    className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                  >
                    Abrir caso
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