import Link from "next/link";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { getClientDashboardData } from "@/src/services/client-dashboard";

type ClientCasesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

type ClientCaseStatusFilter =
  | "all"
  | "active"
  | "new"
  | "in_progress"
  | "waiting_client"
  | "finished";

function formatDate(value: string | null): string {
  if (!value) {
    return "Sem data";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function limitText(value: string | null, maxLength: number): string {
  if (!value) {
    return "Nenhuma descrição informada.";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function isFinishedStatus(status: string): boolean {
  return status === "closed" || status === "resolved";
}

function isActiveStatus(status: string): boolean {
  return !isFinishedStatus(status);
}

function normalizeStatusFilter(
  value: string | undefined,
): ClientCaseStatusFilter {
  if (
    value === "active" ||
    value === "new" ||
    value === "in_progress" ||
    value === "waiting_client" ||
    value === "finished"
  ) {
    return value;
  }

  return "all";
}

function matchesStatus(
  caseStatus: string,
  filter: ClientCaseStatusFilter,
): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "active") {
    return isActiveStatus(caseStatus);
  }

  if (filter === "finished") {
    return isFinishedStatus(caseStatus);
  }

  return caseStatus === filter;
}

function normalizeSearch(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase("pt-BR") ?? "";
}

export default async function ClientCasesPage({
  searchParams,
}: ClientCasesPageProps) {
  const query = await searchParams;
  const { client, cases } = await getClientDashboardData();

  if (!client) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-7 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-red-700">
            Portal do cliente
          </p>

          <h1 className="mt-3 text-3xl font-bold text-red-950">
            Cadastro não encontrado
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-red-800">
            Não encontramos um cadastro de cliente vinculado ao seu acesso.
            Entre em contato com o escritório para verificar o e-mail utilizado.
          </p>
        </div>
      </section>
    );
  }

  const search = normalizeSearch(query.q);
  const statusFilter = normalizeStatusFilter(query.status);

  const activeCases = cases.filter((legalCase) =>
    isActiveStatus(legalCase.status),
  );

  const waitingCases = cases.filter(
    (legalCase) => legalCase.status === "waiting_client",
  );

  const finishedCases = cases.filter((legalCase) =>
    isFinishedStatus(legalCase.status),
  );

  const filteredCases = cases.filter((legalCase) => {
    const matchesText =
      !search ||
      legalCase.title.toLocaleLowerCase("pt-BR").includes(search) ||
      legalCase.description
        ?.toLocaleLowerCase("pt-BR")
        .includes(search);

    return (
      matchesText && matchesStatus(legalCase.status, statusFilter)
    );
  });

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid xl:grid-cols-[1.35fr_0.65fr]">
          <div className="p-7 md:p-8">
            <Link
              href="/dashboard/client"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para a área do cliente
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Acompanhamento
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Acompanhe seus atendimentos
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#B8C2CC]">
              Veja o andamento das suas solicitações, consulte mensagens,
              documentos e informações enviadas pelo escritório.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/client/services"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Solicitar novo atendimento
              </Link>

              <Link
                href="/dashboard/client/meetings"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Minhas reuniões
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
              Resumo
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0B1D2D] p-4">
                <p className="text-[11px] text-[#8FA0AE]">Total</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {cases.length}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0B1D2D] p-4">
                <p className="text-[11px] text-[#8FA0AE]">Ativos</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {activeCases.length}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0B1D2D] p-4">
                <p className="text-[11px] text-[#8FA0AE]">
                  Aguardando você
                </p>
                <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                  {waitingCases.length}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0B1D2D] p-4">
                <p className="text-[11px] text-[#8FA0AE]">
                  Finalizados
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {finishedCases.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {waitingCases.length > 0 ? (
        <section className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
            Atenção necessária
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold text-[#0B1D2D]">
                O escritório está aguardando seu retorno
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#7A5B24]">
                Você possui {waitingCases.length} atendimento(s) aguardando
                informação, mensagem ou documento.
              </p>
            </div>

            <a
              href="?status=waiting_client"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Ver agora
            </a>
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
            Localizar atendimento
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
            Buscar e filtrar
          </h2>
        </div>

        <form
          method="get"
          className="grid gap-4 p-5 md:grid-cols-[1fr_260px_auto] md:p-6"
        >
          <div>
            <label
              htmlFor="q"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Buscar
            </label>

            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query.q ?? ""}
              placeholder="Digite o título ou parte da descrição..."
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Situação
            </label>

            <select
              id="status"
              name="status"
              defaultValue={statusFilter}
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="new">Novos</option>
              <option value="in_progress">Em andamento</option>
              <option value="waiting_client">Aguardando você</option>
              <option value="finished">Finalizados</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-auto min-h-12 rounded-xl bg-[#0B1D2D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
          >
            Aplicar
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Seus atendimentos
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              {filteredCases.length} resultado(s)
            </h2>
          </div>

          {search || statusFilter !== "all" ? (
            <Link
              href="/dashboard/client/cases"
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Limpar filtros
            </Link>
          ) : null}
        </div>

        {filteredCases.length === 0 ? (
          <div className="p-8 text-center md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F2EFEA] text-2xl">
              🔎
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#0B1D2D]">
              Nenhum atendimento encontrado
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5B6472]">
              Ajuste os filtros ou escolha um serviço para abrir uma nova
              solicitação.
            </p>

            <Link
              href="/dashboard/client/services"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Ver serviços
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#ECE7DD]">
            {filteredCases.map((legalCase) => (
              <article key={legalCase.id} className="p-5 md:p-6">
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <CaseStatusBadge status={legalCase.status} />
                      <CasePriorityBadge priority={legalCase.priority} />
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-[#0B1D2D]">
                      {legalCase.title}
                    </h3>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5B6472]">
                      {limitText(legalCase.description, 190)}
                    </p>

                    <p className="mt-3 text-xs text-[#8FA0AE]">
                      Criado em {formatDate(legalCase.created_at)}
                    </p>

                    {legalCase.status === "waiting_client" ? (
                      <p className="mt-3 inline-flex rounded-xl border border-[#E7D7B5] bg-[#FFF8E8] px-3 py-2 text-xs font-semibold text-[#9E762D]">
                        O escritório está aguardando seu retorno.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/dashboard/client/cases/${legalCase.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-[#0B1D2D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
                    >
                      Abrir atendimento
                    </Link>

                    <Link
                      href={`/dashboard/client/meetings?caseId=${legalCase.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#E7D7B5] bg-[#FFF8E8] px-5 py-3 text-sm font-semibold text-[#9E762D] transition hover:border-[#C89B4A] hover:bg-[#F7E7C4]"
                    >
                      Solicitar reunião
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[1.75rem] border border-[#D8D2C7] bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Precisa de outro atendimento?
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#0B1D2D]">
              Encontre o serviço adequado
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#5B6472]">
              A página de serviços ajuda você a escolher o assunto sem precisar
              conhecer termos jurídicos.
            </p>
          </div>

          <Link
            href="/dashboard/client/services"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
          >
            Abrir central de serviços
          </Link>
        </div>
      </section>
    </section>
  );
}