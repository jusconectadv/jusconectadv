import Link from "next/link";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import {
  getCaseTimeline,
  type CaseTimelineEventType,
  type CaseTimelineEventVisibility,
} from "@/src/services/case-timeline";

type CaseTimelinePageProps = {
  params: Promise<{
    id: string;
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

function getEventTypeLabel(type: CaseTimelineEventType): string {
  const labels: Record<CaseTimelineEventType, string> = {
    case_created: "Caso",
    message: "Mensagem",
    document: "Documento",
    note: "Nota",
    task_created: "Tarefa",
    task_done: "Tarefa concluída",
    task_pending: "Tarefa",
  };

  return labels[type];
}

function getEventTypeClassName(type: CaseTimelineEventType): string {
  const classes: Record<CaseTimelineEventType, string> = {
    case_created: "border-slate-200 bg-slate-50 text-slate-700",
    message: "border-cyan-200 bg-cyan-50 text-cyan-700",
    document: "border-purple-200 bg-purple-50 text-purple-700",
    note: "border-amber-200 bg-amber-50 text-amber-700",
    task_created: "border-blue-200 bg-blue-50 text-blue-700",
    task_done: "border-emerald-200 bg-emerald-50 text-emerald-700",
    task_pending: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return classes[type];
}

function getVisibilityLabel(visibility: CaseTimelineEventVisibility): string {
  if (visibility === "internal") {
    return "Interno";
  }

  return "Visível no caso";
}

function getVisibilityClassName(
  visibility: CaseTimelineEventVisibility,
): string {
  if (visibility === "internal") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getSenderLabel(senderType: string | null): string {
  if (!senderType) {
    return "Sistema";
  }

  if (senderType === "client") {
    return "Cliente";
  }

  if (senderType === "lawyer") {
    return "Escritório";
  }

  if (senderType === "ia") {
    return "IA";
  }

  if (senderType === "internal") {
    return "Interno";
  }

  return senderType;
}

export default async function CaseTimelinePage({
  params,
}: CaseTimelinePageProps) {
  const resolvedParams = await params;
  const data = await getCaseTimeline(resolvedParams.id);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Link
            href={`/dashboard/cases/${data.legal_case.id}`}
            className="text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            ← Voltar para o caso
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Histórico completo
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Timeline do caso
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Veja os principais acontecimentos do caso em ordem cronológica:
                mensagens, documentos, notas internas e tarefas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <CaseStatusBadge status={data.legal_case.status} />
              <CasePriorityBadge priority={data.legal_case.priority} />
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Eventos</p>

            <strong className="mt-2 block text-3xl font-semibold text-slate-950">
              {data.summary.total_events}
            </strong>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-cyan-600">Mensagens</p>

            <strong className="mt-2 block text-3xl font-semibold text-cyan-700">
              {data.summary.messages}
            </strong>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-purple-600">Documentos</p>

            <strong className="mt-2 block text-3xl font-semibold text-purple-700">
              {data.summary.documents}
            </strong>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-600">Notas</p>

            <strong className="mt-2 block text-3xl font-semibold text-amber-700">
              {data.summary.notes}
            </strong>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-600">Tarefas</p>

            <strong className="mt-2 block text-3xl font-semibold text-blue-700">
              {data.summary.tasks}
            </strong>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Dados do caso
            </h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Título</dt>
                <dd className="mt-1 text-slate-950">{data.legal_case.title}</dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Cliente</dt>
                <dd className="mt-1 text-slate-950">{data.client.name}</dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Criado em</dt>
                <dd className="mt-1 text-slate-950">
                  {formatDateTime(data.legal_case.created_at)}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Eventos públicos</dt>
                <dd className="mt-1 text-slate-950">
                  {data.summary.public_events}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Eventos internos</dt>
                <dd className="mt-1 text-slate-950">
                  {data.summary.internal_events}
                </dd>
              </div>
            </dl>

            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-900">
                Observação
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Notas internas e tarefas aparecem apenas para o escritório. O
                cliente não visualiza esses registros internos.
              </p>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Linha do tempo
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Eventos mais recentes aparecem primeiro.
              </p>
            </div>

            {data.events.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Nenhum evento encontrado.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.events.map((event) => (
                  <article key={event.id} className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getEventTypeClassName(
                              event.type,
                            )}`}
                          >
                            {getEventTypeLabel(event.type)}
                          </span>

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getVisibilityClassName(
                              event.visibility,
                            )}`}
                          >
                            {getVisibilityLabel(event.visibility)}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-semibold text-slate-950">
                          {event.title}
                        </h3>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {event.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>{formatDateTime(event.created_at)}</span>
                          <span>Origem: {getSenderLabel(event.sender_type)}</span>
                        </div>
                      </div>

                      {event.href ? (
                        <Link
                          href={event.href}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Abrir caso
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}