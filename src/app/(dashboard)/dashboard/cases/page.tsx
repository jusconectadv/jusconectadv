import Link from "next/link";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { listCases } from "@/src/services/cases";

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

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR").format(parsedDate);
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

function limitText(value: string | null, maxLength: number): string {
  if (!value) {
    return "Sem descrição.";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
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
      selectedStatus === "all" ||
      legalCase.status === selectedStatus ||
      (selectedStatus === "closed" &&
        (legalCase.status === "closed" || legalCase.status === "resolved"));

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

  const urgentCases = cases.filter(
    (legalCase) => legalCase.priority === "urgent",
  ).length;

  const hasActiveFilters =
    Boolean(search) || selectedStatus !== "all" || selectedPriority !== "all";

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Atendimento jurídico
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Casos
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Gerencie, filtre e acompanhe os atendimentos jurídicos vinculados
              aos clientes do escritório.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/cases/kanban"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Ver Kanban
              </Link>

              <Link
                href="/dashboard/clients"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Ver clientes
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
                Resumo dos casos
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Total</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {totalCases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Em andamento</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {inProgressCases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Aguardando</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {waitingClientCases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Urgentes</p>
                  <p className="mt-1 text-2xl font-bold text-red-300">
                    {urgentCases}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">Total</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {totalCases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Casos cadastrados
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Novos</p>

          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {newCases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Ainda não iniciados
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">
            Em andamento
          </p>

          <strong className="mt-2 block text-3xl font-bold text-emerald-700">
            {inProgressCases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Atendimento ativo
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#9E762D]">
            Aguardando
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {waitingClientCases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Retorno do cliente
          </p>
        </div>

        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">Finalizados</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {closedCases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Encerrados/resolvidos
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Filtros
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Buscar e filtrar casos
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Pesquise por título, descrição ou nome do cliente.
            </p>
          </div>

          {hasActiveFilters ? (
            <Link
              href="/dashboard/cases"
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Limpar filtros
            </Link>
          ) : null}
        </div>

        <form className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.7fr_0.7fr_auto] lg:items-end">
          <div>
            <label
              htmlFor="q"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Busca
            </label>

            <input
              id="q"
              name="q"
              type="search"
              defaultValue={search}
              placeholder="Título, descrição ou cliente..."
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={selectedStatus}
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Prioridade
            </label>

            <select
              id="priority"
              name="priority"
              defaultValue={selectedPriority}
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            >
              {priorityOptions.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#0B1D2D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
          >
            Aplicar
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Lista
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Casos encontrados
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              {filteredCases.length} de {totalCases} caso(s) exibido(s).
            </p>
          </div>

          <Link
            href="/dashboard/cases/new"
            className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
          >
            Novo caso
          </Link>
        </div>

        {filteredCases.length === 0 ? (
          <div className="p-8">
            <div className="rounded-3xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-8 text-center">
              <h3 className="text-base font-bold text-[#0B1D2D]">
                Nenhum caso encontrado
              </h3>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#5B6472]">
                Ajuste os filtros ou crie um novo atendimento jurídico para o
                cliente.
              </p>

              <Link
                href="/dashboard/cases/new"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Criar novo caso
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#ECE7DD]">
            {filteredCases.map((legalCase) => (
              <article
                key={legalCase.id}
                className="p-5 transition hover:bg-[#F8F6F1]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <CaseStatusBadge status={legalCase.status} />
                      <CasePriorityBadge priority={legalCase.priority} />
                    </div>

                    <Link href={`/dashboard/cases/${legalCase.id}`}>
                      <h3 className="mt-3 text-lg font-bold text-[#0B1D2D] transition hover:text-[#9E762D]">
                        {legalCase.title}
                      </h3>
                    </Link>

                    <p className="mt-2 text-sm font-semibold text-[#5B6472]">
                      Cliente:{" "}
                      <span className="text-[#0B1D2D]">
                        {legalCase.client_name ?? "Cliente não localizado"}
                      </span>
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#5B6472]">
                      {limitText(legalCase.description, 220)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#8FA0AE]">
                      <span>Criado em {formatDate(legalCase.created_at)}</span>

                      <span>Status: {getStatusLabel(legalCase.status)}</span>

                      <span>
                        Prioridade: {getPriorityLabel(legalCase.priority)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link
                      href={`/dashboard/cases/${legalCase.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                    >
                      Abrir
                    </Link>

                    <Link
                      href={`/dashboard/cases/${legalCase.id}/edit`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                    >
                      Editar
                    </Link>

                    <Link
                      href={`/dashboard/cases/${legalCase.id}/templates`}
                      className="inline-flex items-center justify-center rounded-xl bg-[#0B1D2D] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#132D44]"
                    >
                      Templates
                    </Link>
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