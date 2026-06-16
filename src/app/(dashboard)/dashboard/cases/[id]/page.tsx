import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CaseInternalNotesSection } from "@/src/components/cases/CaseInternalNotesSection";
import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { CaseTasksSection } from "@/src/components/cases/CaseTasksSection";
import { CopyClientLinkButton } from "@/src/components/cases/CopyClientLinkButton";
import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import {
  getCaseDocumentUrl,
  listCaseDocuments,
  uploadCaseDocumentAction,
} from "@/src/services/case-documents";
import {
  listCaseMessages,
  sendCaseMessageAction,
} from "@/src/services/case-messages";
import { updateCaseStatusAction } from "@/src/services/case-status";
import { generateCaseAnalysisAction } from "@/src/services/cases-ai";

type CaseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const senderLabels: Record<string, string> = {
  client: "Cliente",
  lawyer: "Escritório",
  ia: "IA",
};

const documentSenderLabels: Record<string, string> = {
  client: "Enviado pelo cliente",
  lawyer: "Enviado pelo escritório",
  ia: "Gerado pela IA",
};

function formatFileSize(size: number | null): string {
  if (!size) {
    return "0 KB";
  }

  const sizeInKb = size / 1024;

  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(1)} KB`;
  }

  return `${(sizeInKb / 1024).toFixed(2)} MB`;
}

function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getSuccessMessage(success: string | undefined): string | null {
  if (success === "case-updated") {
    return "Caso atualizado com sucesso.";
  }

  if (success === "document-uploaded") {
    return "Documento(s) enviado(s) com sucesso.";
  }

  if (success === "message-sent") {
    return "Mensagem enviada com sucesso.";
  }

  return null;
}

function getSenderBadgeClassName(senderType: string): string {
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

export default async function CaseDetailPage({
  params,
  searchParams,
}: CaseDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const successMessage = getSuccessMessage(query.success);

  const context = await requireUserContext();

  if (context.role !== "lawyer" && context.role !== "master") {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data: legalCase } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (!legalCase) {
    notFound();
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", legalCase.client_id)
    .eq("tenant_id", context.tenant.id)
    .single();

  if (!client) {
    notFound();
  }

  const messages = await listCaseMessages(legalCase.id);
  const documents = await listCaseDocuments(legalCase.id);

  const documentsWithUrls = await Promise.all(
    documents.map(async (document) => ({
      ...document,
      url: document.storage_path
        ? await getCaseDocumentUrl(document.storage_path)
        : null,
    })),
  );

  const clientDocuments = documentsWithUrls.filter(
    (document) => document.sender_type === "client",
  );

  const lawyerDocuments = documentsWithUrls.filter(
    (document) => document.sender_type !== "client",
  );

  const clientPortalPath = legalCase.public_token
    ? `/acompanhar/${legalCase.public_token}`
    : null;

  const clientPortalUrl = clientPortalPath
    ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}${clientPortalPath}`
    : null;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <Link
              href="/dashboard/cases"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para casos
            </Link>

            <div className="mt-5 flex flex-wrap gap-2">
              <CaseStatusBadge status={legalCase.status} />
              <CasePriorityBadge priority={legalCase.priority} />
            </div>

            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              {legalCase.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#B8C2CC]">
              Cliente vinculado:{" "}
              <Link
                href={`/dashboard/clients/${client.id}`}
                className="font-bold text-white underline-offset-4 hover:text-[#C89B4A] hover:underline"
              >
                {client.name}
              </Link>
            </p>

            <p className="mt-4 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-[#D8DEE5]">
              {legalCase.description ?? "Sem descrição informada."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/dashboard/cases/${legalCase.id}/edit`}
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Editar caso
              </Link>

              <Link
                href={`/dashboard/cases/${legalCase.id}/timeline`}
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Timeline
              </Link>

              <Link
                href={`/dashboard/cases/${legalCase.id}/templates`}
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Gerar documento
              </Link>

              <form action={generateCaseAnalysisAction}>
                <input type="hidden" name="caseId" value={legalCase.id} />

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
                >
                  Gerar análise IA
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Ações rápidas
              </p>

              <div className="mt-5 grid gap-3">
                <form action={updateCaseStatusAction}>
                  <input type="hidden" name="caseId" value={legalCase.id} />
                  <input type="hidden" name="status" value="in_progress" />

                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-left text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
                  >
                    Iniciar atendimento
                  </button>
                </form>

                <form action={updateCaseStatusAction}>
                  <input type="hidden" name="caseId" value={legalCase.id} />
                  <input type="hidden" name="status" value="waiting_client" />

                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-[#C89B4A]/40 bg-[#C89B4A]/10 px-4 py-3 text-left text-sm font-bold text-[#F7E2B6] transition hover:bg-[#C89B4A]/20"
                  >
                    Aguardando cliente
                  </button>
                </form>

                <form action={updateCaseStatusAction}>
                  <input type="hidden" name="caseId" value={legalCase.id} />
                  <input type="hidden" name="status" value="closed" />

                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-left text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20"
                  >
                    Finalizar caso
                  </button>
                </form>
              </div>

              <div className="mt-6 rounded-2xl bg-[#0B1D2D] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C89B4A]">
                  Portal do cliente
                </p>

                {clientPortalPath && clientPortalUrl ? (
                  <div className="mt-3 flex flex-col gap-3">
                    <Link
                      href={clientPortalPath}
                      target="_blank"
                      className="text-sm font-semibold text-white underline-offset-4 hover:text-[#C89B4A] hover:underline"
                    >
                      Abrir acompanhamento público
                    </Link>

                    <CopyClientLinkButton url={clientPortalUrl} />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#B8C2CC]">
                    Token público não gerado para este caso.
                  </p>
                )}
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

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <aside className="space-y-6 xl:col-span-1">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Informações
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Dados do caso
              </h2>
            </div>

            <dl className="space-y-5 p-5 text-sm">
              <div>
                <dt className="text-[#5B6472]">Status</dt>

                <dd className="mt-1">
                  <CaseStatusBadge status={legalCase.status} />
                </dd>
              </div>

              <div>
                <dt className="text-[#5B6472]">Prioridade</dt>

                <dd className="mt-1">
                  <CasePriorityBadge priority={legalCase.priority} />
                </dd>
              </div>

              <div>
                <dt className="text-[#5B6472]">Cliente</dt>

                <dd className="mt-1">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                  >
                    {client.name}
                  </Link>
                </dd>
              </div>

              <div>
                <dt className="text-[#5B6472]">Documento</dt>

                <dd className="mt-1 font-medium text-[#0B1D2D]">
                  {client.document ?? "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="text-[#5B6472]">Contato</dt>

                <dd className="mt-1 leading-6 text-[#0B1D2D]">
                  {client.email ?? "E-mail não informado"}
                  <br />
                  {client.phone ?? "Telefone não informado"}
                </dd>
              </div>
            </dl>
          </div>

          <CaseInternalNotesSection caseId={legalCase.id} />

          <CaseTasksSection caseId={legalCase.id} />
        </aside>

        <div className="space-y-6 xl:col-span-2">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                  Inteligência
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                  Análise IA
                </h2>

                <p className="mt-1 text-sm text-[#5B6472]">
                  Resumo e leitura inicial do atendimento.
                </p>
              </div>

              <form action={generateCaseAnalysisAction}>
                <input type="hidden" name="caseId" value={legalCase.id} />

                <button
                  type="submit"
                  className="rounded-xl bg-[#0B1D2D] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#132D44]"
                >
                  Atualizar análise
                </button>
              </form>
            </div>

            {legalCase.summary_ai ? (
              <div className="whitespace-pre-wrap p-5 text-sm leading-7 text-[#0B1D2D]">
                {legalCase.summary_ai}
              </div>
            ) : (
              <div className="p-5">
                <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-5 text-sm leading-6 text-[#5B6472]">
                  Nenhuma análise gerada ainda. Clique em{" "}
                  <strong>Gerar análise IA</strong> para criar um resumo inicial
                  do caso.
                </div>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                    Arquivos
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                    Documentos do caso
                  </h2>

                  <p className="mt-1 text-sm text-[#5B6472]">
                    PDFs, contratos, provas e anexos vinculados ao atendimento.
                  </p>
                </div>

                <form
                  action={uploadCaseDocumentAction}
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-white p-4 xl:max-w-md"
                >
                  <input type="hidden" name="caseId" value={legalCase.id} />

                  <label
                    htmlFor="files"
                    className="mb-2 block text-sm font-bold text-[#0B1D2D]"
                  >
                    Enviar documento(s)
                  </label>

                  <input
                    id="files"
                    type="file"
                    name="files"
                    multiple
                    required
                    className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] file:mr-3 file:rounded-xl file:border-0 file:bg-[#0B1D2D] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                  />

                  <p className="mt-2 text-xs leading-5 text-[#5B6472]">
                    Você pode selecionar até 10 arquivos. Cada arquivo pode ter
                    até 20MB.
                  </p>

                  <button
                    type="submit"
                    className="mt-3 w-full rounded-xl bg-[#0B1D2D] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
                  >
                    Enviar documento(s)
                  </button>
                </form>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-[#0B1D2D]">
                  Enviados pelo cliente
                </h3>

                <div className="mt-3 space-y-3">
                  {clientDocuments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-4 text-sm text-[#5B6472]">
                      Nenhum documento enviado pelo cliente.
                    </div>
                  ) : (
                    clientDocuments.map((document) => (
                      <div
                        key={document.id}
                        className="rounded-2xl border border-[#D8D2C7] bg-white p-4 transition hover:border-[#C89B4A]/60 hover:bg-[#F8F6F1]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <a
                              href={document.url ?? "#"}
                              target={document.url ? "_blank" : undefined}
                              aria-disabled={!document.url}
                              className={`font-bold underline-offset-4 ${
                                document.url
                                  ? "text-[#0B1D2D] hover:text-[#9E762D] hover:underline"
                                  : "pointer-events-none text-[#8FA0AE]"
                              }`}
                            >
                              {document.file_name}
                            </a>

                            <p className="mt-1 text-xs text-[#5B6472]">
                              {formatFileSize(document.file_size)}
                            </p>
                          </div>

                          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            Cliente
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-[#8FA0AE]">
                          {documentSenderLabels[document.sender_type] ??
                            document.sender_type}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#0B1D2D]">
                  Enviados pelo escritório
                </h3>

                <div className="mt-3 space-y-3">
                  {lawyerDocuments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-4 text-sm text-[#5B6472]">
                      Nenhum documento enviado pelo escritório.
                    </div>
                  ) : (
                    lawyerDocuments.map((document) => (
                      <div
                        key={document.id}
                        className="rounded-2xl border border-[#D8D2C7] bg-white p-4 transition hover:border-[#C89B4A]/60 hover:bg-[#F8F6F1]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <a
                              href={document.url ?? "#"}
                              target={document.url ? "_blank" : undefined}
                              aria-disabled={!document.url}
                              className={`font-bold underline-offset-4 ${
                                document.url
                                  ? "text-[#0B1D2D] hover:text-[#9E762D] hover:underline"
                                  : "pointer-events-none text-[#8FA0AE]"
                              }`}
                            >
                              {document.file_name}
                            </a>

                            <p className="mt-1 text-xs text-[#5B6472]">
                              {formatFileSize(document.file_size)}
                            </p>
                          </div>

                          <span className="rounded-full border border-[#E7D7B5] bg-[#FFF8E8] px-3 py-1 text-xs font-bold text-[#9E762D]">
                            Escritório
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-[#8FA0AE]">
                          {documentSenderLabels[document.sender_type] ??
                            document.sender_type}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Comunicação
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Conversa do caso
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Histórico de mensagens entre escritório, cliente e IA.
              </p>
            </div>

            <div className="space-y-3 p-5">
              {messages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-5 text-sm text-[#5B6472]">
                  Nenhuma mensagem registrada ainda.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-2xl border border-[#D8D2C7] bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span
                        className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${getSenderBadgeClassName(
                          message.sender_type,
                        )}`}
                      >
                        {senderLabels[message.sender_type] ??
                          message.sender_type}
                      </span>

                      <span className="text-xs font-medium text-[#8FA0AE]">
                        {formatDateTime(message.created_at)}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-7 text-[#0B1D2D]">
                      {message.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form
              action={sendCaseMessageAction}
              className="border-t border-[#ECE7DD] bg-[#F8F6F1] p-5"
            >
              <input type="hidden" name="caseId" value={legalCase.id} />

              <label
                htmlFor="content"
                className="text-sm font-bold text-[#0B1D2D]"
              >
                Responder ao cliente
              </label>

              <textarea
                id="content"
                name="content"
                required
                rows={4}
                placeholder="Escreva uma resposta para o cliente..."
                className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
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
        </div>
      </div>
    </section>
  );
}