import Link from "next/link";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { getClientDetails } from "@/src/services/client-details";

type ClientDetailsPageProps = {
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

function getSenderLabel(senderType: string): string {
  if (senderType === "client") {
    return "Cliente";
  }

  if (senderType === "lawyer") {
    return "Escritório";
  }

  if (senderType === "ia") {
    return "IA";
  }

  return "Sistema";
}

function limitText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function getClientTypeLabel(type: string | null): string {
  if (type === "PJ") {
    return "Pessoa jurídica";
  }

  if (type === "PF") {
    return "Pessoa física";
  }

  return "Não informado";
}

export default async function ClientDetailsPage({
  params,
}: ClientDetailsPageProps) {
  const resolvedParams = await params;
  const details = await getClientDetails(resolvedParams.id);

  const client = details.client;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-start">
          <div>
            <Link
              href="/dashboard/clients"
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              ← Voltar para clientes
            </Link>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Detalhe do cliente
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {client.name}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Histórico consolidado de casos, mensagens e documentos vinculados
              a este cliente.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/cases/new"
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Novo caso
            </Link>

            <Link
              href="/dashboard/cases"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Ver casos
            </Link>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-950">
              Dados do cliente
            </h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Nome</dt>
                <dd className="mt-1 text-slate-900">{client.name}</dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Tipo</dt>
                <dd className="mt-1 text-slate-900">
                  {getClientTypeLabel(client.type)}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">E-mail</dt>
                <dd className="mt-1 text-slate-900">
                  {client.email ?? "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Telefone</dt>
                <dd className="mt-1 text-slate-900">
                  {client.phone ?? "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Cadastro</dt>
                <dd className="mt-1 text-slate-900">
                  {formatDateTime(client.created_at)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total de casos
              </p>

              <strong className="mt-2 block text-3xl font-semibold text-slate-950">
                {details.summary.total_cases}
              </strong>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-blue-600">Novos</p>

              <strong className="mt-2 block text-3xl font-semibold text-blue-700">
                {details.summary.new_cases}
              </strong>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-emerald-600">
                Em andamento
              </p>

              <strong className="mt-2 block text-3xl font-semibold text-emerald-700">
                {details.summary.in_progress_cases}
              </strong>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-amber-600">
                Aguardando cliente
              </p>

              <strong className="mt-2 block text-3xl font-semibold text-amber-700">
                {details.summary.waiting_client_cases}
              </strong>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Casos vinculados
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Todos os atendimentos criados para este cliente.
              </p>
            </div>

            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {details.summary.total_cases} caso(s)
            </span>
          </div>

          {details.cases.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                Nenhum caso vinculado.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Quando um atendimento for aberto para este cliente, ele
                aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {details.cases.map((caseItem) => (
                <article key={caseItem.id} className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CaseStatusBadge status={caseItem.status} />
                        <CasePriorityBadge priority={caseItem.priority} />
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-slate-950">
                        {caseItem.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {caseItem.description
                          ? limitText(caseItem.description, 180)
                          : "Sem descrição informada."}
                      </p>

                      <p className="mt-3 text-xs text-slate-500">
                        Criado em {formatDateTime(caseItem.created_at)}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/cases/${caseItem.id}`}
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

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Mensagens recentes
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Últimas mensagens nos casos deste cliente.
              </p>
            </div>

            {details.recent_messages.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Nenhuma mensagem recente.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {details.recent_messages.map((message) => (
                  <article key={message.id} className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          {getSenderLabel(message.sender_type)}
                        </span>

                        <span className="text-xs text-slate-500">
                          {formatDateTime(message.created_at)}
                        </span>
                      </div>

                      <Link
                        href={`/dashboard/cases/${message.case_id}`}
                        className="font-semibold text-slate-950 hover:text-slate-700"
                      >
                        {message.case_title}
                      </Link>

                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                        {limitText(message.content, 180)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Documentos recentes
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Arquivos enviados nos casos deste cliente.
              </p>
            </div>

            {details.recent_documents.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Nenhum documento recente.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {details.recent_documents.map((document) => (
                  <article key={document.id} className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                          {getSenderLabel(document.sender_type)}
                        </span>

                        <span className="text-xs text-slate-500">
                          {formatDateTime(document.created_at)}
                        </span>
                      </div>

                      <Link
                        href={`/dashboard/cases/${document.case_id}`}
                        className="font-semibold text-slate-950 hover:text-slate-700"
                      >
                        {document.file_name}
                      </Link>

                      <p className="text-sm leading-6 text-slate-600">
                        Caso: {document.case_title}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}