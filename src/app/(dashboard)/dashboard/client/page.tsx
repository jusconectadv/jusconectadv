import Link from "next/link";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { getClientDashboardData } from "@/src/services/client-dashboard";

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

function isClosedStatus(status: string): boolean {
  return status === "resolved" || status === "closed";
}

function isWaitingClientStatus(status: string): boolean {
  return status === "waiting_client";
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

export default async function ClientDashboardPage() {
  const { client, cases } = await getClientDashboardData();

  const activeCases = cases.filter(
    (legalCase) => !isClosedStatus(legalCase.status),
  );
  const closedCases = cases.filter((legalCase) =>
    isClosedStatus(legalCase.status),
  );
  const waitingClientCases = cases.filter((legalCase) =>
    isWaitingClientStatus(legalCase.status),
  );

  if (!client) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="overflow-hidden rounded-[2rem] border border-red-200 bg-red-50 shadow-sm">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-red-700">
              Portal do cliente
            </p>

            <h1 className="mt-3 text-3xl font-bold text-red-950">
              Cadastro não encontrado
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-red-800">
              Não encontramos um cadastro de cliente vinculado ao seu usuário.
              Verifique se você entrou com o mesmo e-mail usado no atendimento.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Portal do cliente
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Olá, {client.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Acompanhe seus atendimentos, envie mensagens, consulte documentos
              e abra novas solicitações para o escritório.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/client/cases/new"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Novo atendimento
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
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Resumo dos atendimentos
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
                  <p className="mt-1 text-2xl font-bold text-white">
                    {activeCases.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Aguardando</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {waitingClientCases.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Finalizados</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {closedCases.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">
            Total de atendimentos
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {cases.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Histórico vinculado a você
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">
            Em andamento
          </p>

          <strong className="mt-2 block text-3xl font-bold text-emerald-700">
            {activeCases.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Atendimentos ativos
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#9E762D]">
            Aguardando você
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {waitingClientCases.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Pendentes de retorno
          </p>
        </div>

        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">Finalizados</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {closedCases.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Atendimentos encerrados
          </p>
        </div>

        <Link
          href="/dashboard/client/meetings"
          className="rounded-3xl border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/70 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-[#9E762D]">
            Reuniões
          </p>

          <strong className="mt-2 block text-xl font-bold text-[#0B1D2D]">
            Agendar
          </strong>

          <p className="mt-2 text-xs leading-5 text-[#7A5B24]">
            Solicite uma reunião com o escritório.
          </p>
        </Link>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Meus casos
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Meus atendimentos
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Veja abaixo os casos vinculados ao seu cadastro.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/client/meetings"
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Minhas reuniões
            </Link>

            <span className="rounded-full border border-[#D8D2C7] bg-white px-3 py-2 text-xs font-bold text-[#0B1D2D]">
              {cases.length} atendimento(s)
            </span>
          </div>
        </div>

        {cases.length === 0 ? (
          <div className="p-8">
            <div className="rounded-3xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-8 text-center">
              <h3 className="font-bold text-[#0B1D2D]">
                Nenhum atendimento encontrado
              </h3>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#5B6472]">
                Você ainda não possui atendimentos registrados.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/dashboard/client/cases/new"
                  className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
                >
                  Abrir primeiro atendimento
                </Link>

                <Link
                  href="/dashboard/client/meetings"
                  className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-5 py-3 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                >
                  Minhas reuniões
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#ECE7DD]">
            {cases.map((legalCase) => (
              <article
                key={legalCase.id}
                className="p-5 transition hover:bg-[#F8F6F1]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <CaseStatusBadge status={legalCase.status} />
                      <CasePriorityBadge priority={legalCase.priority} />
                    </div>

                    <Link
                      href={`/dashboard/client/cases/${legalCase.id}`}
                      className="text-base font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                    >
                      {legalCase.title}
                    </Link>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5B6472]">
                      {limitText(legalCase.description, 180)}
                    </p>

                    <p className="mt-3 text-xs text-[#8FA0AE]">
                      Criado em {formatDate(legalCase.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/client/cases/${legalCase.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                    >
                      Abrir atendimento
                    </Link>

                    <Link
                      href="/dashboard/client/meetings"
                      className="inline-flex items-center justify-center rounded-xl border border-[#E7D7B5] bg-[#FFF8E8] px-4 py-2 text-sm font-semibold text-[#9E762D] transition hover:border-[#C89B4A] hover:bg-[#F7E7C4]"
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
    </section>
  );
}