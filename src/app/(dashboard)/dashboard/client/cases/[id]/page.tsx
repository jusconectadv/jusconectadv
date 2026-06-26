import Link from "next/link";

import { SubmitButton } from "@/src/components/shared/SubmitButton";
import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import {
  getClientCaseDetailData,
  sendAuthenticatedClientMessageAction,
  uploadAuthenticatedClientDocumentAction,
} from "@/src/services/client-dashboard";

type ClientCaseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const senderLabels: Record<string, string> = {
  client: "Você",
  lawyer: "Escritório",
  ia: "IA",
};

const documentSenderLabels: Record<string, string> = {
  client: "Enviado por você",
  lawyer: "Enviado pelo escritório",
  ia: "Gerado pela IA",
};

function formatFileSize(size: number | null): string {
  if (!size || size <= 0) {
    return "0 KB";
  }

  const sizeInKb = size / 1024;

  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(1)} KB`;
  }

  return `${(sizeInKb / 1024).toFixed(2)} MB`;
}

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

function getMessageBubbleClassName(senderType: string): string {
  if (senderType === "client") {
    return "border-blue-200 bg-blue-50";
  }

  if (senderType === "lawyer") {
    return "border-[#E7D7B5] bg-[#FFF8E8]";
  }

  return "border-purple-200 bg-purple-50";
}

function getMessageLabelClassName(senderType: string): string {
  if (senderType === "client") {
    return "text-blue-700";
  }

  if (senderType === "lawyer") {
    return "text-[#9E762D]";
  }

  return "text-purple-700";
}

function getDocumentBadgeClassName(senderType: string): string {
  if (senderType === "client") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (senderType === "lawyer") {
    return "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]";
  }

  return "border-purple-200 bg-purple-50 text-purple-700";
}

function getSuccessMessage(success: string | undefined): string | null {
  if (success === "case-created") {
    return "Atendimento criado com sucesso.";
  }

  if (success === "message-sent") {
    return "Mensagem enviada com sucesso.";
  }

  if (success === "document-uploaded") {
    return "Documento(s) enviado(s) com sucesso.";
  }

  return null;
}

export default async function ClientCaseDetailPage({
  params,
  searchParams,
}: ClientCaseDetailPageProps) {
  const resolvedParams = await params;
  const query = await searchParams;

  const { client, legalCase, messages, documents } =
    await getClientCaseDetailData(resolvedParams.id);

  const successMessage = getSuccessMessage(query.success);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <Link
              href="/dashboard/client"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para meus atendimentos
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Atendimento do cliente
            </p>

            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              {legalCase.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#B8C2CC]">
              Acompanhe o andamento do seu atendimento, envie mensagens ao
              escritório e anexe documentos relacionados ao caso.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <CaseStatusBadge status={legalCase.status} />
              <CasePriorityBadge priority={legalCase.priority} />
            </div>

            {legalCase.public_token ? (
              <div className="mt-6">
                <Link
                  href={`/acompanhar/${legalCase.public_token}`}
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
                >
                  Abrir acompanhamento público
                </Link>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Resumo
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA0AE]">
                    Cliente
                  </p>

                  <p className="mt-1 font-bold text-white">{client.name}</p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA0AE]">
                    Criado em
                  </p>

                  <p className="mt-1 font-bold text-white">
                    {formatDateTime(legalCase.created_at)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA0AE]">
                    Código público
                  </p>

                  <p className="mt-1 break-all font-mono text-xs leading-5 text-white">
                    {legalCase.public_token ?? "Não disponível"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {query.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {query.error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Atendimento
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Resumo do atendimento
              </h2>
            </div>

            <dl className="space-y-5 p-5 text-sm">
              <div>
                <dt className="font-semibold text-[#5B6472]">Status</dt>
                <dd className="mt-2">
                  <CaseStatusBadge status={legalCase.status} />
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">Prioridade</dt>
                <dd className="mt-2">
                  <CasePriorityBadge priority={legalCase.priority} />
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">
                  Descrição inicial
                </dt>

                <dd className="mt-2 whitespace-pre-wrap rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] p-4 leading-6 text-[#0B1D2D]">
                  {legalCase.description ?? "Sem descrição."}
                </dd>
              </div>
            </dl>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Documentos
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Enviar documento(s)
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#5B6472]">
                Envie provas, PDFs, imagens, contratos ou documentos
                relacionados ao atendimento.
              </p>
            </div>

            <form
              action={uploadAuthenticatedClientDocumentAction}
              className="space-y-4 p-5"
            >
              <input type="hidden" name="caseId" value={legalCase.id} />

              <input
                type="file"
                name="files"
                multiple
                required
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] file:mr-3 file:rounded-xl file:border-0 file:bg-[#0B1D2D] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
              />

              <p className="text-xs leading-5 text-[#5B6472]">
                Você pode selecionar até 10 arquivos. Cada arquivo pode ter até
                20MB.
              </p>

              <SubmitButton
                pendingText="Enviando documento(s)..."
                className="w-full rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Enviar documento(s)
              </SubmitButton>
            </form>
          </div>

          <div className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Informações privadas
            </p>

            <h2 className="mt-2 text-base font-bold text-[#0B1D2D]">
              Área do cliente
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
              Notas internas, tarefas e prazos administrativos são privados do
              escritório e não aparecem nesta área do cliente.
            </p>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Comunicação
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Conversa do atendimento
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#5B6472]">
                Use este espaço para responder ao escritório e acompanhar as
                mensagens recebidas.
              </p>
            </div>

            <div className="space-y-3 p-5">
              {messages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-5 text-sm text-[#5B6472]">
                  Nenhuma mensagem registrada ainda.
                </div>
              ) : (
                messages.map((message) => (
                  <article
                    key={message.id}
                    className={`rounded-2xl border p-4 ${getMessageBubbleClassName(
                      message.sender_type,
                    )}`}
                  >
                    <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${getMessageLabelClassName(
                          message.sender_type,
                        )}`}
                      >
                        {senderLabels[message.sender_type] ??
                          message.sender_type}
                      </span>

                      <span className="text-xs text-[#5B6472]">
                        {formatDateTime(message.created_at)}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-[#0B1D2D]">
                      {message.content}
                    </p>
                  </article>
                ))
              )}
            </div>

            <form
              action={sendAuthenticatedClientMessageAction}
              className="border-t border-[#ECE7DD] bg-[#F8F6F1] p-5"
            >
              <input type="hidden" name="caseId" value={legalCase.id} />

              <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                Nova mensagem
              </label>

              <textarea
                name="content"
                required
                rows={4}
                placeholder="Digite sua mensagem para o escritório..."
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-[#0B1D2D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
                >
                  Enviar mensagem
                </button>
              </div>
            </form>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                  Arquivos
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                  Documentos do caso
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#5B6472]">
                  Arquivos enviados por você ou pelo escritório durante o
                  atendimento.
                </p>
              </div>

              <span className="rounded-full border border-[#D8D2C7] bg-white px-3 py-1 text-xs font-bold text-[#0B1D2D]">
                {documents.length} documento(s)
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#5B6472]">
                Nenhum documento enviado ainda.
              </div>
            ) : (
              <div className="divide-y divide-[#ECE7DD]">
                {documents.map((document) => (
                  <article
                    key={document.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-[#F8F6F1] md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getDocumentBadgeClassName(
                          document.sender_type,
                        )}`}
                      >
                        {documentSenderLabels[document.sender_type] ??
                          document.sender_type}
                      </span>

                      <h3 className="mt-3 font-bold text-[#0B1D2D]">
                        {document.file_name}
                      </h3>

                      <p className="mt-1 text-xs text-[#5B6472]">
                        {formatFileSize(document.file_size)} •{" "}
                        {formatDateTime(document.created_at)}
                      </p>
                    </div>

                    {document.url ? (
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                      >
                        Baixar/Abrir
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-[#F8F6F1] px-4 py-2 text-sm font-semibold text-[#8FA0AE]">
                        Indisponível
                      </span>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>
    </section>
  );
}
