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

  const activeCases = cases.filter((legalCase) => !isClosedStatus(legalCase.status));
  const closedCases = cases.filter((legalCase) => isClosedStatus(legalCase.status));
  const waitingClientCases = cases.filter((legalCase) =>
    isWaitingClientStatus(legalCase.status),
  );

  if (!client) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
        <section className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Portal do cliente
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              Cadastro não encontrado
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Não encontramos um cadastro de cliente vinculado ao seu usuário.
              Verifique se você entrou com o mesmo e-mail usado no atendimento.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Portal do cliente
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Olá, {client.name}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Acompanhe seus atendimentos, envie mensagens, consulte documentos
              e abra novas solicitações para o escritório.
            </p>
          </div>

          <Link
            href="/dashboard/client/cases/new"
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Novo atendimento
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total de atendimentos
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {cases.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">
              Em andamento
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {activeCases.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-600">
              Aguardando você
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-700">
              {waitingClientCases.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Finalizados</p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {closedCases.length}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Meus atendimentos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Veja abaixo os casos vinculados ao seu cadastro.
              </p>
            </div>

            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {cases.length} atendimento(s)
            </span>
          </div>

          {cases.length === 0 ? (
            <div className="p-6">
              <div className="rounded-xl bg-slate-50 p-8 text-center">
                <h3 className="font-semibold text-slate-950">
                  Nenhum atendimento encontrado
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Você ainda não possui atendimentos registrados.
                </p>

                <Link
                  href="/dashboard/client/cases/new"
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Abrir primeiro atendimento
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cases.map((legalCase) => (
                <article key={legalCase.id} className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <CaseStatusBadge status={legalCase.status} />
                        <CasePriorityBadge priority={legalCase.priority} />
                      </div>

                      <Link
                        href={`/dashboard/client/cases/${legalCase.id}`}
                        className="text-base font-semibold text-slate-950 hover:text-slate-700"
                      >
                        {legalCase.title}
                      </Link>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {limitText(legalCase.description, 180)}
                      </p>

                      <p className="mt-3 text-xs text-slate-500">
                        Criado em {formatDate(legalCase.created_at)}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/client/cases/${legalCase.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Abrir atendimento
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}