import Link from "next/link";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { updateCaseStatusAction } from "@/src/services/case-status";
import { listCases } from "@/src/services/cases";

type CasesKanbanPageProps = {
  searchParams: Promise<{
    error?: string;
    q?: string;
    priority?: string;
    view?: string;
  }>;
};

type CaseListItem = Awaited<ReturnType<typeof listCases>>[number];

type KanbanColumn = {
  key: string;
  title: string;
  description: string;
  accentClassName: string;
};

type StatusAction = {
  label: string;
  status: string;
  className: string;
};

const kanbanColumns: KanbanColumn[] = [
  {
    key: "new",
    title: "Novos",
    description: "Casos recebidos e ainda não iniciados.",
    accentClassName: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    key: "in_progress",
    title: "Em andamento",
    description: "Casos em análise ou atendimento ativo.",
    accentClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    key: "waiting_client",
    title: "Aguardando cliente",
    description: "Casos parados aguardando retorno ou documento.",
    accentClassName: "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]",
  },
  {
    key: "closed",
    title: "Finalizados",
    description: "Casos encerrados ou resolvidos.",
    accentClassName: "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]",
  },
];

function formatDate(date: string | null): string {
  if (!date) {
    return "Sem data";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(parsedDate);
}

function limitText(value: string | null, maxLength: number): string {
  if (!value) {
    return "Sem descrição.";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function normalizeSearch(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function normalizeFilter(value: string | undefined): string {
  return value?.trim() ?? "";
}

function isValidPriority(value: string): boolean {
  return (
    value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "urgent"
  );
}

function getCaseSearchText(legalCase: CaseListItem): string {
  return [
    legalCase.title,
    legalCase.description,
    legalCase.status,
    legalCase.priority,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterCases(params: {
  cases: CaseListItem[];
  search: string;
  priority: string;
  view: string;
}): CaseListItem[] {
  return params.cases.filter((legalCase) => {
    const matchesSearch = params.search
      ? getCaseSearchText(legalCase).includes(params.search)
      : true;

    const matchesPriority =
      params.priority && isValidPriority(params.priority)
        ? legalCase.priority === params.priority
        : true;

    const matchesView =
      params.view === "active"
        ? legalCase.status === "new" ||
          legalCase.status === "in_progress" ||
          legalCase.status === "waiting_client"
        : params.view === "urgent"
          ? legalCase.priority === "urgent"
          : params.view === "waiting_client"
            ? legalCase.status === "waiting_client"
            : true;

    return matchesSearch && matchesPriority && matchesView;
  });
}

function getCasesByColumnStatus(cases: CaseListItem[], status: string) {
  if (status === "closed") {
    return cases.filter(
      (legalCase) =>
        legalCase.status === "closed" || legalCase.status === "resolved",
    );
  }

  return cases.filter((legalCase) => legalCase.status === status);
}

function getStatusActions(status: string): StatusAction[] {
  if (status === "new") {
    return [
      {
        label: "Iniciar",
        status: "in_progress",
        className:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
      },
      {
        label: "Aguardar",
        status: "waiting_client",
        className:
          "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D] hover:bg-[#F7E7C4]",
      },
      {
        label: "Finalizar",
        status: "closed",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      },
    ];
  }

  if (status === "in_progress") {
    return [
      {
        label: "Aguardar",
        status: "waiting_client",
        className:
          "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D] hover:bg-[#F7E7C4]",
      },
      {
        label: "Finalizar",
        status: "closed",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      },
    ];
  }

  if (status === "waiting_client") {
    return [
      {
        label: "Retomar",
        status: "in_progress",
        className:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
      },
      {
        label: "Finalizar",
        status: "closed",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      },
    ];
  }

  return [
    {
      label: "Reabrir",
      status: "in_progress",
      className:
        "border-[#D8D2C7] bg-white text-[#0B1D2D] hover:border-[#C89B4A] hover:text-[#9E762D]",
    },
  ];
}

function getViewLabel(view: string): string {
  if (view === "active") {
    return "Somente ativos";
  }

  if (view === "urgent") {
    return "Somente urgentes";
  }

  if (view === "waiting_client") {
    return "Aguardando cliente";
  }

  return "Todos";
}

export default async function CasesKanbanPage({
  searchParams,
}: CasesKanbanPageProps) {
  const query = await searchParams;

  const search = normalizeSearch(query.q);
  const priority = normalizeFilter(query.priority);
  const view = normalizeFilter(query.view);

  const cases = await listCases();

  const filteredCases = filterCases({
    cases,
    search,
    priority,
    view,
  });

  const totalCases = cases.length;
  const filteredTotalCases = filteredCases.length;

  const urgentCases = filteredCases.filter(
    (legalCase) => legalCase.priority === "urgent",
  ).length;

  const waitingClientCases = filteredCases.filter(
    (legalCase) => legalCase.status === "waiting_client",
  ).length;

  const activeCases = filteredCases.filter(
    (legalCase) =>
      legalCase.status === "new" ||
      legalCase.status === "in_progress" ||
      legalCase.status === "waiting_client",
  ).length;

  const hasActiveFilters =
    Boolean(search) || Boolean(priority) || Boolean(view);

  return (
    <section className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <Link
              href="/dashboard/cases"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para lista
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Fluxo operacional
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Kanban de casos
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Visualize, filtre e mova os atendimentos por etapa do fluxo
              jurídico. Ideal para acompanhar urgências, casos ativos e
              solicitações aguardando retorno do cliente.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/cases"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Ver lista
              </Link>

              <Link
                href="/dashboard/search"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Buscar dados
              </Link>

              <Link
                href="/dashboard/cases/new"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Novo caso
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Resumo do fluxo
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Total geral</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {totalCases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Filtrados</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {filteredTotalCases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Urgentes</p>
                  <p className="mt-1 text-2xl font-bold text-red-300">
                    {urgentCases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Aguardando</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {waitingClientCases}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-[#0B1D2D] p-4">
                <p className="text-[11px] text-[#8FA0AE]">Visão atual</p>
                <p className="mt-1 font-bold text-white">
                  {getViewLabel(view)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {query.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {query.error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
            Filtros do Kanban
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
            Refinar visualização
          </h2>

          <p className="mt-1 text-sm text-[#5B6472]">
            Use os filtros para encontrar casos por título, descrição,
            prioridade ou situação operacional.
          </p>
        </div>

        <form className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto] lg:items-end">
          <div>
            <label
              htmlFor="q"
              className="text-sm font-bold text-[#0B1D2D]"
            >
              Buscar
            </label>

            <input
              id="q"
              name="q"
              defaultValue={query.q ?? ""}
              placeholder="Título, descrição, status ou prioridade..."
              className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="text-sm font-bold text-[#0B1D2D]"
            >
              Prioridade
            </label>

            <select
              id="priority"
              name="priority"
              defaultValue={priority}
              className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            >
              <option value="">Todas</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="view"
              className="text-sm font-bold text-[#0B1D2D]"
            >
              Visão
            </label>

            <select
              id="view"
              name="view"
              defaultValue={view}
              className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            >
              <option value="">Todos</option>
              <option value="active">Somente ativos</option>
              <option value="urgent">Somente urgentes</option>
              <option value="waiting_client">Aguardando cliente</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <button
              type="submit"
              className="rounded-xl bg-[#0B1D2D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
            >
              Filtrar
            </button>

            {hasActiveFilters ? (
              <Link
                href="/dashboard/cases/kanban"
                className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-5 py-3 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
              >
                Limpar
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">Filtrados</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {filteredTotalCases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            De {totalCases} caso(s) no total
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Ativos</p>

          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {activeCases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Novos, em andamento ou aguardando
          </p>
        </div>

        <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-700">Urgentes</p>

          <strong className="mt-2 block text-3xl font-bold text-red-700">
            {urgentCases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Exigem atenção imediata
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#9E762D]">
            Aguardando cliente
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {waitingClientCases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Dependem de retorno ou documento
          </p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-4">
        {kanbanColumns.map((column) => {
          const columnCases = getCasesByColumnStatus(filteredCases, column.key);

          return (
            <div
              key={column.key}
              className="min-h-[480px] rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
            >
              <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${column.accentClassName}`}
                    >
                      {columnCases.length} caso(s)
                    </span>

                    <h2 className="mt-3 text-lg font-bold text-[#0B1D2D]">
                      {column.title}
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-[#5B6472]">
                      {column.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">
                {columnCases.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-5 text-sm leading-6 text-[#5B6472]">
                    Nenhum caso nesta coluna com os filtros atuais.
                  </div>
                ) : (
                  columnCases.map((legalCase) => (
                    <article
                      key={legalCase.id}
                      className="rounded-2xl border border-[#D8D2C7] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/60 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/dashboard/cases/${legalCase.id}`}
                          className="min-w-0 flex-1 text-sm font-bold leading-5 text-[#0B1D2D] underline-offset-4 hover:text-[#9E762D] hover:underline"
                        >
                          {legalCase.title}
                        </Link>

                        <CasePriorityBadge priority={legalCase.priority} />
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#5B6472]">
                        {limitText(legalCase.description, 140)}
                      </p>

                      <div className="mt-4 grid gap-2 text-xs text-[#5B6472]">
                        <div className="rounded-xl border border-[#ECE7DD] bg-[#F8F6F1] px-3 py-2">
                          Criado em:{" "}
                          <strong className="text-[#0B1D2D]">
                            {formatDate(legalCase.created_at)}
                          </strong>
                        </div>

                        <div className="rounded-xl border border-[#ECE7DD] bg-[#F8F6F1] px-3 py-2">
                          Atualizado em:{" "}
                          <strong className="text-[#0B1D2D]">
                            {formatDate(legalCase.updated_at)}
                          </strong>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {getStatusActions(String(legalCase.status)).map(
                          (action) => (
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
                                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${action.className}`}
                              >
                                {action.label}
                              </button>
                            </form>
                          ),
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>
    </section>
  );
}