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
    task_created: "border-amber-200 bg-amber-50 text-amber-700",
    note_created: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return classes[type];
}

export default async function DashboardActivityPage() {
  const { summary, activities } = await listLawyerActivities();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Painel do advogado
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Atividades recentes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Veja os últimos movimentos do escritório: casos, mensagens,
              documentos, tarefas e notas internas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/search"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Busca global
            </Link>

            <Link
              href="/dashboard/tasks"
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Ver tarefas
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total</p>

            <strong className="mt-2 block text-3xl font-semibold text-slate-950">
              {summary.total}
            </strong>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-600">Casos</p>

            <strong className="mt-2 block text-3xl font-semibold text-blue-700">
              {summary.cases}
            </strong>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">Mensagens</p>

            <strong className="mt-2 block text-3xl font-semibold text-emerald-700">
              {summary.messages}
            </strong>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-purple-600">Documentos</p>

            <strong className="mt-2 block text-3xl font-semibold text-purple-700">
              {summary.documents}
            </strong>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-600">Tarefas</p>

            <strong className="mt-2 block text-3xl font-semibold text-amber-700">
              {summary.tasks}
            </strong>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Notas</p>

            <strong className="mt-2 block text-3xl font-semibold text-slate-800">
              {summary.notes}
            </strong>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Feed do escritório
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Últimas atividades registradas nos casos do tenant atual.
            </p>
          </div>

          {activities.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                Nenhuma atividade encontrada.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Quando houver movimentações nos casos, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((activity) => (
                <article key={activity.id} className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getActivityClassName(
                            activity.type,
                          )}`}
                        >
                          {getActivityLabel(activity.type)}
                        </span>

                        <span className="text-xs font-medium text-slate-400">
                          {formatDateTime(activity.created_at)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-slate-950">
                        {activity.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {activity.description}
                      </p>

                      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                        <div>
                          <dt className="font-medium text-slate-500">Caso</dt>
                          <dd className="mt-1 text-slate-800">
                            {activity.case_title}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium text-slate-500">
                            Cliente
                          </dt>
                          <dd className="mt-1 text-slate-800">
                            {activity.client_name ?? "Cliente não informado"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <Link
                      href={activity.href}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Abrir caso
                    </Link>
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