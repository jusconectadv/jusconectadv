import Link from "next/link";

import { searchLawyerWorkspace } from "@/src/services/lawyer-search";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

function getDisplayDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
}

function getPreview(text: string, maxLength = 180): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

function getClientTypeLabel(type: string): string {
  if (type === "PJ") {
    return "Pessoa jurídica";
  }

  if (type === "PF") {
    return "Pessoa física";
  }

  return type;
}

function getClientTypeClassName(type: string): string {
  if (type === "PJ") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

function getClientStatusClassName(active: boolean): string {
  if (active) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function getCaseStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: "Novo",
    in_progress: "Em andamento",
    waiting_client: "Aguardando cliente",
    closed: "Fechado",
    resolved: "Resolvido",
  };

  return labels[status] ?? status;
}

function getCaseStatusClassName(status: string): string {
  if (status === "new") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (status === "in_progress") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "waiting_client") {
    return "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]";
  }

  return "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
}

function getCasePriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
  };

  return labels[priority] ?? priority;
}

function getCasePriorityClassName(priority: string): string {
  if (priority === "urgent") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (priority === "high") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  if (priority === "medium") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
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

export default async function LawyerSearchPage({
  searchParams,
}: SearchPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams.q?.trim() ?? "";
  const result = await searchLawyerWorkspace(query);

  const hasQuery = query.length > 0;
  const hasEnoughQuery = query.length >= 2;
  const hasResults = result.total > 0;
  const communicationsTotal = result.messages.length + result.documents.length;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Central de pesquisa
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Busca global
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Encontre informações internas do escritório em clientes, casos,
              mensagens e documentos. No futuro, esta área também poderá receber
              consultas por CPF, CNPJ, processos e patrimônio.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Voltar
              </Link>

              <Link
                href="/dashboard/activity"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Atividades
              </Link>

              <Link
                href="/dashboard/clients"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Clientes
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Resultado da busca
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Total</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {result.total}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Clientes</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {result.clients.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Casos</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {result.cases.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Comunicações</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {communicationsTotal}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
            Pesquisa interna
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
            O que você deseja encontrar?
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#5B6472]">
            Busque por nome, CPF/CNPJ, e-mail, telefone, título do caso, trecho
            de mensagem ou nome de documento.
          </p>
        </div>

        <form
          className="grid gap-3 p-5 md:grid-cols-[1fr_auto]"
          action="/dashboard/search"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Busque por nome, CPF/CNPJ, e-mail, título do caso, mensagem ou documento..."
            className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
          />

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#0B1D2D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
          >
            Buscar
          </button>
        </form>

        {hasQuery && !hasEnoughQuery ? (
          <div className="border-t border-[#ECE7DD] bg-[#FFF8E8] px-5 py-4 text-sm font-semibold text-[#9E762D]">
            Digite pelo menos 2 caracteres para iniciar a busca.
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">
            Total encontrado
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {result.total}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Registros encontrados
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Clientes</p>

          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {result.clients.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Pessoas físicas e jurídicas
          </p>
        </div>

        <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-purple-700">Casos</p>

          <strong className="mt-2 block text-3xl font-bold text-purple-700">
            {result.cases.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Atendimentos internos
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">
            Comunicações
          </p>

          <strong className="mt-2 block text-3xl font-bold text-emerald-700">
            {communicationsTotal}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Mensagens e documentos
          </p>
        </div>
      </section>

      {!hasQuery ? (
        <section className="rounded-[1.75rem] border border-dashed border-[#D8D2C7] bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-[#0B1D2D]">
            Comece pesquisando algo do escritório
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#5B6472]">
            Exemplos: nome do cliente, CPF/CNPJ, e-mail, telefone, título do
            caso, trecho de uma mensagem ou nome de um documento.
          </p>
        </section>
      ) : null}

      {hasQuery && hasEnoughQuery && !hasResults ? (
        <section className="rounded-[1.75rem] border border-[#D8D2C7] bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-[#0B1D2D]">
            Nenhum resultado encontrado
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#5B6472]">
            Tente buscar por outro termo, como nome do cliente, documento,
            e-mail, título do caso ou nome de arquivo.
          </p>
        </section>
      ) : null}

      {hasResults ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Clientes
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Clientes encontrados
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Pessoas físicas e jurídicas encontradas.
              </p>
            </div>

            <div className="divide-y divide-[#ECE7DD]">
              {result.clients.length === 0 ? (
                <p className="p-5 text-sm text-[#5B6472]">
                  Nenhum cliente encontrado.
                </p>
              ) : (
                result.clients.map((client) => (
                  <Link
                    key={client.id}
                    href={client.href}
                    className="block p-5 transition hover:bg-[#F8F6F1]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getClientTypeClassName(
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

                        <p className="mt-3 font-bold text-[#0B1D2D]">
                          {client.name}
                        </p>

                        <p className="mt-1 text-sm text-[#5B6472]">
                          {client.document ?? "Sem documento"}
                        </p>

                        <p className="mt-1 text-sm text-[#5B6472]">
                          {client.email ?? "Sem e-mail"}
                          {client.phone ? ` · ${client.phone}` : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Casos
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Casos encontrados
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Atendimentos e processos internos encontrados.
              </p>
            </div>

            <div className="divide-y divide-[#ECE7DD]">
              {result.cases.length === 0 ? (
                <p className="p-5 text-sm text-[#5B6472]">
                  Nenhum caso encontrado.
                </p>
              ) : (
                result.cases.map((legalCase) => (
                  <Link
                    key={legalCase.id}
                    href={legalCase.href}
                    className="block p-5 transition hover:bg-[#F8F6F1]"
                  >
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getCaseStatusClassName(
                          legalCase.status,
                        )}`}
                      >
                        {getCaseStatusLabel(legalCase.status)}
                      </span>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getCasePriorityClassName(
                          legalCase.priority,
                        )}`}
                      >
                        {getCasePriorityLabel(legalCase.priority)}
                      </span>
                    </div>

                    <p className="mt-3 font-bold text-[#0B1D2D]">
                      {legalCase.title}
                    </p>

                    <p className="mt-1 text-sm text-[#5B6472]">
                      Cliente: {legalCase.client_name ?? "Não informado"}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                      {getPreview(legalCase.description ?? "Sem descrição.")}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Mensagens
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Mensagens encontradas
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Trechos encontrados nas conversas dos casos.
              </p>
            </div>

            <div className="divide-y divide-[#ECE7DD]">
              {result.messages.length === 0 ? (
                <p className="p-5 text-sm text-[#5B6472]">
                  Nenhuma mensagem encontrada.
                </p>
              ) : (
                result.messages.map((message) => (
                  <Link
                    key={message.id}
                    href={message.href}
                    className="block p-5 transition hover:bg-[#F8F6F1]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getSenderClassName(
                          message.sender_type,
                        )}`}
                      >
                        {getSenderLabel(message.sender_type)}
                      </span>

                      <span className="text-xs font-semibold text-[#8FA0AE]">
                        {getDisplayDate(message.created_at)}
                      </span>
                    </div>

                    <p className="mt-3 font-bold text-[#0B1D2D]">
                      Caso: {message.case_title ?? "Caso não localizado"}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                      {getPreview(message.content)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Documentos
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Documentos encontrados
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Arquivos enviados nos casos.
              </p>
            </div>

            <div className="divide-y divide-[#ECE7DD]">
              {result.documents.length === 0 ? (
                <p className="p-5 text-sm text-[#5B6472]">
                  Nenhum documento encontrado.
                </p>
              ) : (
                result.documents.map((document) => (
                  <Link
                    key={document.id}
                    href={document.href}
                    className="block p-5 transition hover:bg-[#F8F6F1]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getSenderClassName(
                          document.sender_type,
                        )}`}
                      >
                        {getSenderLabel(document.sender_type)}
                      </span>

                      <span className="text-xs font-semibold text-[#8FA0AE]">
                        {getDisplayDate(document.created_at)}
                      </span>
                    </div>

                    <p className="mt-3 font-bold text-[#0B1D2D]">
                      {document.file_name}
                    </p>

                    <p className="mt-1 text-sm text-[#5B6472]">
                      Caso: {document.case_title ?? "Caso não localizado"}
                    </p>

                    <p className="mt-2 text-xs text-[#5B6472]">
                      {document.file_type ?? "Tipo não informado"}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
          Futuro módulo jurídico
        </p>

        <h2 className="mt-2 text-base font-bold text-[#0B1D2D]">
          Consultas externas — em breve
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
          Esta área poderá receber integrações para CPF, CNPJ, localização de
          bens, consultas processuais, certidões e outras ferramentas de apoio
          ao advogado.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-4">
          <span className="rounded-xl border border-[#E7D7B5] bg-white/50 px-4 py-3 text-sm font-bold text-[#7A5B24]">
            CPF / CNPJ
          </span>

          <span className="rounded-xl border border-[#E7D7B5] bg-white/50 px-4 py-3 text-sm font-bold text-[#7A5B24]">
            Busca de bens
          </span>

          <span className="rounded-xl border border-[#E7D7B5] bg-white/50 px-4 py-3 text-sm font-bold text-[#7A5B24]">
            Processos
          </span>

          <span className="rounded-xl border border-[#E7D7B5] bg-white/50 px-4 py-3 text-sm font-bold text-[#7A5B24]">
            Certidões
          </span>
        </div>
      </section>
    </section>
  );
}