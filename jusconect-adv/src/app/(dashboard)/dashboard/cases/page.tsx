import Link from "next/link";

import { listCases } from "@/src/services/cases";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";

type CasesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
  }>;
};

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "new", label: "Novos" },
  { value: "in_progress", label: "Em andamento" },
  { value: "waiting_client", label: "Aguardando cliente" },
  { value: "closed", label: "Finalizados" },
];

const priorityOptions = [
  { value: "all", label: "Todas" },
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

function formatDate(date: string | null): string {
  if (!date) {
    return "Sem data";
  }

  return new Date(date).toLocaleDateString("pt-BR");
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStatusLabel(status: string): string {
  const option = statusOptions.find((item) => item.value === status);

  return option?.label ?? status;
}

function getPriorityLabel(priority: string): string {
  const option = priorityOptions.find((item) => item.value === priority);

  return option?.label ?? priority;
}

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const query = await searchParams;
  const cases = await listCases();

  const search = query.q?.trim() ?? "";
  const selectedStatus = query.status?.trim() || "all";
  const selectedPriority = query.priority?.trim() || "all";

  const normalizedSearch = normalizeText(search);

  const filteredCases = cases.filter((legalCase) => {
    const matchesSearch =
      !normalizedSearch ||
      normalizeText(legalCase.title).includes(normalizedSearch) ||
      normalizeText(legalCase.description).includes(normalizedSearch) ||
      normalizeText(legalCase.client_name).includes(normalizedSearch);

    const matchesStatus =
      selectedStatus === "all" || legalCase.status === selectedStatus;

    const matchesPriority =
      selectedPriority === "all" || legalCase.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCases = cases.length;

  const newCases = cases.filter(
    (legalCase) => legalCase.status === "new",
  ).length;

  const inProgressCases = cases.filter(
    (legalCase) => legalCase.status === "in_progress",
  ).length;

  const waitingClientCases = cases.filter(
    (legalCase) => legalCase.status === "waiting_client",
  ).length;

  const closedCases = cases.filter(
    (legalCase) =>
      legalCase.status === "closed" || legalCase.status === "resolved",
  ).length;

  const hasActiveFilters =
    Boolean(search) || selectedStatus !== "all" || selectedPriority !== "all";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Casos</h1>

          <p className="mt-2 text-slate-600">
            Gerencie, filtre e acompanhe os atendimentos jurídicos vinculados
            aos clientes.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/dashboard/cases/kanban"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver Kanban
          </Link>

          <Link
            href="/dashboard/cases/new"
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Novo caso
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total de casos</p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalCases}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Novos</p>

          <p className="mt-2 text-3xl font-bold text-slate-950">{newCases}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Em andamento</p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {inProgressCases}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Aguardando cliente</p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {waitingClientCases}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Finalizados</p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {closedCases}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
          <div>
            <label
              htmlFor="q"
              className="block text-sm font-medium text-slate-700"
            >
              Buscar
            </label>

            <input
              id="q"
              name="q"
              type="search"
              defaultValue={search}
              placeholder="Buscar por título, descrição ou cliente..."
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-950"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-slate-700"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={selectedStatus}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-950"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-slate-700"
            >
              Prioridade
            </label>

            <select
              id="priority"
              name="priority"
              defaultValue={selectedPriority}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-950"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Filtrar
            </button>

            {hasActiveFilters ? (
              <Link
                href="/dashboard/cases"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Limpar
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Lista de casos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredCases.length} caso(s) encontrado(s)
              {hasActiveFilters ? " com os filtros atuais." : "."}
            </p>
          </div>

          {hasActiveFilters ? (
            <div className="flex flex-wrap gap-2">
              {search ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Busca: {search}
                </span>
              ) : null}

              {selectedStatus !== "all" ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Status: {getStatusLabel(selectedStatus)}
                </span>
              ) : null}

              {selectedPriority !== "all" ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Prioridade: {getPriorityLabel(selectedPriority)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {cases.length === 0 ? (
          <div className="p-6">
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <h3 className="font-semibold text-slate-950">
                Nenhum caso cadastrado ainda
              </h3>

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
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-6">
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <h3 className="font-semibold text-slate-950">
                Nenhum caso encontrado
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tente remover ou ajustar os filtros aplicados.
              </p>

              <Link
                href="/dashboard/cases"
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Limpar filtros
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredCases.map((legalCase) => (
              <Link
                key={legalCase.id}
                href={`/dashboard/cases/${legalCase.id}`}
                className="block p-6 transition hover:bg-slate-50"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <CaseStatusBadge status={legalCase.status} />
                      <CasePriorityBadge priority={legalCase.priority} />
                    </div>

                    <h3 className="mt-3 text-base font-semibold text-slate-950">
                      {legalCase.title}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Cliente:{" "}
                      {legalCase.client_name ?? "Cliente não localizado"}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {legalCase.description ?? "Sem descrição."}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 text-sm text-slate-500 xl:text-right">
                    <div>
                      <p>Criado em</p>

                      <p className="font-medium text-slate-700">
                        {formatDate(legalCase.created_at)}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      Clique para abrir
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}