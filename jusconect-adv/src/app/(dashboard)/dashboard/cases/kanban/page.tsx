import Link from "next/link";

import { listCases } from "@/src/services/cases";
import { updateCaseStatusAction } from "@/src/services/case-status";
import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";

type CasesKanbanPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const kanbanColumns = [
  {
    key: "new",
    title: "Novos",
    description: "Casos recebidos e ainda não iniciados.",
  },
  {
    key: "in_progress",
    title: "Em andamento",
    description: "Casos em análise ou atendimento ativo.",
  },
  {
    key: "waiting_client",
    title: "Aguardando cliente",
    description: "Casos parados aguardando retorno ou documento.",
  },
  {
    key: "closed",
    title: "Finalizados",
    description: "Casos encerrados ou resolvidos.",
  },
];

function formatDate(date: string | null): string {
  if (!date) {
    return "Sem data";
  }

  return new Date(date).toLocaleDateString("pt-BR");
}

function getCasesByColumnStatus(
  cases: Awaited<ReturnType<typeof listCases>>,
  status: string,
) {
  if (status === "closed") {
    return cases.filter(
      (legalCase) =>
        legalCase.status === "closed" || legalCase.status === "resolved",
    );
  }

  return cases.filter((legalCase) => legalCase.status === status);
}

function getStatusActions(status: string) {
  if (status === "new") {
    return [
      {
        label: "Iniciar",
        status: "in_progress",
        className: "bg-blue-600 text-white hover:bg-blue-700",
      },
      {
        label: "Aguardar",
        status: "waiting_client",
        className: "bg-yellow-500 text-white hover:bg-yellow-600",
      },
      {
        label: "Finalizar",
        status: "closed",
        className: "bg-green-600 text-white hover:bg-green-700",
      },
    ];
  }

  if (status === "in_progress") {
    return [
      {
        label: "Aguardar",
        status: "waiting_client",
        className: "bg-yellow-500 text-white hover:bg-yellow-600",
      },
      {
        label: "Finalizar",
        status: "closed",
        className: "bg-green-600 text-white hover:bg-green-700",
      },
    ];
  }

  if (status === "waiting_client") {
    return [
      {
        label: "Retomar",
        status: "in_progress",
        className: "bg-blue-600 text-white hover:bg-blue-700",
      },
      {
        label: "Finalizar",
        status: "closed",
        className: "bg-green-600 text-white hover:bg-green-700",
      },
    ];
  }

  return [
    {
      label: "Reabrir",
      status: "in_progress",
      className: "bg-slate-950 text-white hover:bg-slate-800",
    },
  ];
}

export default async function CasesKanbanPage({
  searchParams,
}: CasesKanbanPageProps) {
  const query = await searchParams;
  const cases = await listCases();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard/cases"
            className="text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            ← Voltar para lista
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-950">
            Kanban de casos
          </h1>

          <p className="mt-2 text-slate-600">
            Visualize e mova os atendimentos por etapa do fluxo jurídico.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/dashboard/cases"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver lista
          </Link>

          <Link
            href="/dashboard/cases/new"
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Novo caso
          </Link>
        </div>
      </div>

      {query.error ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {query.error}
        </div>
      ) : null}

      {cases.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Nenhum caso cadastrado ainda
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Crie o primeiro caso manualmente ou aguarde uma solicitação pelo
            link público do advogado.
          </p>

          <Link
            href="/dashboard/cases/new"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Criar novo caso
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-4">
          {kanbanColumns.map((column) => {
            const columnCases = getCasesByColumnStatus(cases, column.key);

            return (
              <div
                key={column.key}
                className="flex min-h-[500px] flex-col rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
              >
                <div className="border-b border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-slate-950">
                        {column.title}
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {column.description}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {columnCases.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-3">
                  {columnCases.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
                      Nenhum caso nesta etapa.
                    </div>
                  ) : (
                    columnCases.map((legalCase) => {
                      const actions = getStatusActions(legalCase.status);

                      return (
                        <div
                          key={legalCase.id}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-wrap gap-2">
                            <CasePriorityBadge
                              priority={legalCase.priority}
                            />
                          </div>

                          <Link href={`/dashboard/cases/${legalCase.id}`}>
                            <h3 className="mt-3 line-clamp-2 font-semibold text-slate-950 hover:underline">
                              {legalCase.title}
                            </h3>
                          </Link>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            Cliente:{" "}
                            {legalCase.client_name ??
                              "Cliente não localizado"}
                          </p>

                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                            {legalCase.description ?? "Sem descrição."}
                          </p>

                          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                            <span className="text-xs text-slate-500">
                              {formatDate(legalCase.created_at)}
                            </span>

                            <Link
                              href={`/dashboard/cases/${legalCase.id}`}
                              className="text-xs font-medium text-slate-500 hover:text-slate-950"
                            >
                              Abrir →
                            </Link>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {actions.map((action) => (
                              <form
                                key={`${legalCase.id}-${action.status}`}
                                action={updateCaseStatusAction}
                              >
                                <input
                                  type="hidden"
                                  name="caseId"
                                  value={legalCase.id}
                                />

                                <input
                                  type="hidden"
                                  name="status"
                                  value={action.status}
                                />

                                <input
                                  type="hidden"
                                  name="returnTo"
                                  value="kanban"
                                />

                                <button
                                  type="submit"
                                  className={`rounded-lg px-3 py-2 text-xs font-medium ${action.className}`}
                                >
                                  {action.label}
                                </button>
                              </form>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}