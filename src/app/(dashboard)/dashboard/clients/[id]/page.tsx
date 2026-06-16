import Link from "next/link";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import {
  archiveClientAction,
  restoreClientAction,
} from "@/src/services/client-status";
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

function getSenderClassName(senderType: string): string {
  if (senderType === "client") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (senderType === "lawyer") {
    return "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]";
  }

  if (senderType === "ia") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  return "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
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

function getClientTypeBadgeClassName(type: string | null): string {
  if (type === "PJ") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (type === "PF") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
}

function getClientStatusClassName(active: boolean): string {
  if (active) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

export default async function ClientDetailsPage({
  params,
}: ClientDetailsPageProps) {
  const resolvedParams = await params;
  const details = await getClientDetails(resolvedParams.id);

  const client = details.client;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <Link
              href="/dashboard/clients"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para clientes
            </Link>

            <div className="mt-6 flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getClientTypeBadgeClassName(
                  client.type,
                )}`}
              >
                {getClientTypeLabel(client.type)}
              </span>

              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getClientStatusClassName(
                  client.active,
                )}`}
              >
                {client.active ? "Ativo" : "Arquivado"}
              </span>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Detalhe do cliente
            </p>

            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              {client.name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#B8C2CC]">
              Histórico consolidado de casos, mensagens e documentos vinculados
              a este cliente dentro do escritório.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {client.active ? (
                <Link
                  href={`/dashboard/cases/new?clientId=${client.id}`}
                  className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
                >
                  Novo caso
                </Link>
              ) : null}

              <Link
                href={`/dashboard/clients/${client.id}/edit`}
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Editar cliente
              </Link>

              <Link
                href="/dashboard/cases"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Ver casos
              </Link>

              <Link
                href="/dashboard/search"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Buscar dados
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Resumo do cliente
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Casos</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {details.summary.total_cases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Novos</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {details.summary.new_cases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Em andamento</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {details.summary.in_progress_cases}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Aguardando</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {details.summary.waiting_client_cases}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                {client.active ? (
                  <form action={archiveClientAction}>
                    <input type="hidden" name="clientId" value={client.id} />

                    <button
                      type="submit"
                      className="w-full rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-left text-sm font-bold text-red-100 transition hover:bg-red-500/20"
                    >
                      Arquivar cliente
                    </button>
                  </form>
                ) : (
                  <form action={restoreClientAction}>
                    <input type="hidden" name="clientId" value={client.id} />

                    <button
                      type="submit"
                      className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-left text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20"
                    >
                      Reativar cliente
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">
            Total de casos
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {details.summary.total_cases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Histórico completo do cliente
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Novos</p>

          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {details.summary.new_cases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Aguardando primeira análise
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">
            Em andamento
          </p>

          <strong className="mt-2 block text-3xl font-bold text-emerald-700">
            {details.summary.in_progress_cases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Casos sendo trabalhados
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#9E762D]">
            Aguardando cliente
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {details.summary.waiting_client_cases}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Pendentes de retorno
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Cadastro
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Dados do cliente
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Informações principais para identificação e contato.
            </p>
          </div>

          <dl className="space-y-5 p-5 text-sm">
            <div>
              <dt className="font-semibold text-[#5B6472]">Nome</dt>
              <dd className="mt-1 font-bold text-[#0B1D2D]">{client.name}</dd>
            </div>

            <div>
              <dt className="font-semibold text-[#5B6472]">Tipo</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getClientTypeBadgeClassName(
                    client.type,
                  )}`}
                >
                  {getClientTypeLabel(client.type)}
                </span>
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-[#5B6472]">Documento</dt>
              <dd className="mt-1 text-[#0B1D2D]">
                {client.document ?? "Não informado"}
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-[#5B6472]">E-mail</dt>
              <dd className="mt-1 text-[#0B1D2D]">
                {client.email ?? "Não informado"}
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-[#5B6472]">Telefone</dt>
              <dd className="mt-1 text-[#0B1D2D]">
                {client.phone ?? "Não informado"}
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-[#5B6472]">Cadastro</dt>
              <dd className="mt-1 text-[#0B1D2D]">
                {formatDateTime(client.created_at)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Atendimentos
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Casos vinculados
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Todos os atendimentos criados para este cliente.
              </p>
            </div>

            <span className="rounded-full border border-[#D8D2C7] bg-white px-3 py-1 text-xs font-bold text-[#0B1D2D]">
              {details.summary.total_cases} caso(s)
            </span>
          </div>

          {details.cases.length === 0 ? (
            <div className="p-8">
              <div className="rounded-3xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-8 text-center">
                <p className="text-sm font-bold text-[#0B1D2D]">
                  Nenhum caso vinculado.
                </p>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5B6472]">
                  Quando um atendimento for aberto para este cliente, ele
                  aparecerá aqui.
                </p>

                {client.active ? (
                  <Link
                    href={`/dashboard/cases/new?clientId=${client.id}`}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
                  >
                    Criar primeiro caso
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {details.cases.map((caseItem) => (
                <article
                  key={caseItem.id}
                  className="p-5 transition hover:bg-[#F8F6F1]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CaseStatusBadge status={caseItem.status} />
                        <CasePriorityBadge priority={caseItem.priority} />
                      </div>

                      <Link
                        href={`/dashboard/cases/${caseItem.id}`}
                        className="mt-3 block text-base font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                      >
                        {caseItem.title}
                      </Link>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5B6472]">
                        {caseItem.description
                          ? limitText(caseItem.description, 180)
                          : "Sem descrição informada."}
                      </p>

                      <p className="mt-3 text-xs text-[#8FA0AE]">
                        Criado em {formatDateTime(caseItem.created_at)}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/cases/${caseItem.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                    >
                      Abrir caso
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Comunicação
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Mensagens recentes
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Últimas mensagens nos casos deste cliente.
            </p>
          </div>

          {details.recent_messages.length === 0 ? (
            <div className="p-6 text-sm text-[#5B6472]">
              Nenhuma mensagem recente.
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {details.recent_messages.map((message) => (
                <article
                  key={message.id}
                  className="p-5 transition hover:bg-[#F8F6F1]"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getSenderClassName(
                          message.sender_type,
                        )}`}
                      >
                        {getSenderLabel(message.sender_type)}
                      </span>

                      <span className="text-xs text-[#8FA0AE]">
                        {formatDateTime(message.created_at)}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/cases/${message.case_id}`}
                      className="font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                    >
                      {message.case_title}
                    </Link>

                    <p className="line-clamp-3 text-sm leading-6 text-[#5B6472]">
                      {limitText(message.content, 180)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Documentos
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Documentos recentes
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Arquivos enviados nos casos deste cliente.
            </p>
          </div>

          {details.recent_documents.length === 0 ? (
            <div className="p-6 text-sm text-[#5B6472]">
              Nenhum documento recente.
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {details.recent_documents.map((document) => (
                <article
                  key={document.id}
                  className="p-5 transition hover:bg-[#F8F6F1]"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getSenderClassName(
                          document.sender_type,
                        )}`}
                      >
                        {getSenderLabel(document.sender_type)}
                      </span>

                      <span className="text-xs text-[#8FA0AE]">
                        {formatDateTime(document.created_at)}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/cases/${document.case_id}`}
                      className="font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                    >
                      {document.file_name}
                    </Link>

                    <p className="text-sm leading-6 text-[#5B6472]">
                      Caso: {document.case_title}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}