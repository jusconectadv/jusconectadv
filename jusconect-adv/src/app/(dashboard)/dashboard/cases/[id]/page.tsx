import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { requireUserContext } from "@/src/lib/auth/get-user-context";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { CopyClientLinkButton } from "@/src/components/cases/CopyClientLinkButton";
import { CaseInternalNotesSection } from "@/src/components/cases/CaseInternalNotesSection";
import { CaseTasksSection } from "@/src/components/cases/CaseTasksSection";

import { generateCaseAnalysisAction } from "@/src/services/cases-ai";
import { updateCaseStatusAction } from "@/src/services/case-status";

import {
  listCaseMessages,
  sendCaseMessageAction,
} from "@/src/services/case-messages";

import {
  getCaseDocumentUrl,
  listCaseDocuments,
  uploadCaseDocumentAction,
} from "@/src/services/case-documents";

type CaseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
};

const senderLabels: Record<string, string> = {
  client: "Cliente",
  lawyer: "Advogado",
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

export default async function CaseDetailPage({
  params,
  searchParams,
}: CaseDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const context = await requireUserContext();

  if (context.role !== "lawyer" || !context.tenant) {
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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard/cases"
            className="text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            ← Voltar para casos
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-950">
            {legalCase.title}
          </h1>

          <p className="mt-2 text-slate-600">
            Cliente: <strong>{client.name}</strong>
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <form action={generateCaseAnalysisAction}>
            <input type="hidden" name="caseId" value={legalCase.id} />

            <button
              type="submit"
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Gerar análise IA
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            <form action={updateCaseStatusAction}>
              <input type="hidden" name="caseId" value={legalCase.id} />
              <input type="hidden" name="status" value="in_progress" />

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
              >
                Iniciar atendimento
              </button>
            </form>

            <form action={updateCaseStatusAction}>
              <input type="hidden" name="caseId" value={legalCase.id} />
              <input type="hidden" name="status" value="waiting_client" />

              <button
                type="submit"
                className="rounded-lg bg-yellow-500 px-3 py-2 text-xs font-medium text-white hover:bg-yellow-600"
              >
                Aguardando cliente
              </button>
            </form>

            <form action={updateCaseStatusAction}>
              <input type="hidden" name="caseId" value={legalCase.id} />
              <input type="hidden" name="status" value="closed" />

              <button
                type="submit"
                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
              >
                Finalizar caso
              </button>
            </form>
          </div>
        </div>
      </div>

      {query.error ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {query.error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Dados do caso</h2>

            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Status</dt>

                <dd className="mt-1">
                  <CaseStatusBadge status={legalCase.status} />
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Prioridade</dt>

                <dd className="mt-1">
                  <CasePriorityBadge priority={legalCase.priority} />
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Cliente</dt>

                <dd className="font-medium text-slate-950">{client.name}</dd>
              </div>

              <div>
                <dt className="text-slate-500">Contato</dt>

                <dd className="text-slate-800">
                  {client.email ?? "Email não informado"}

                  <br />

                  {client.phone ?? "Telefone não informado"}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Portal do cliente</dt>

                <dd className="mt-1 flex flex-col gap-2">
                  {clientPortalPath ? (
                    <>
                      <Link
                        href={clientPortalPath}
                        target="_blank"
                        className="font-medium text-slate-950 underline"
                      >
                        Abrir acompanhamento
                      </Link>

                      <CopyClientLinkButton
                        url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}${clientPortalPath}`}
                      />
                    </>
                  ) : (
                    <span className="text-slate-500">Token não gerado</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Descrição</dt>

                <dd className="whitespace-pre-wrap text-slate-800">
                  {legalCase.description ?? "Sem descrição."}
                </dd>
              </div>
            </dl>
          </div>

          <CaseInternalNotesSection caseId={legalCase.id} />

          <CaseTasksSection caseId={legalCase.id} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Análise IA</h2>

            {legalCase.summary_ai ? (
              <div className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">
                {legalCase.summary_ai}
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Nenhuma análise gerada ainda.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-slate-950">
                  Documentos do caso
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  PDFs, contratos, provas e anexos vinculados ao atendimento.
                </p>
              </div>

              <form
                action={uploadCaseDocumentAction}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <input type="hidden" name="caseId" value={legalCase.id} />

                <input type="file" name="file" required className="text-sm" />

                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Enviar
                </button>
              </form>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">
                  Enviados pelo cliente
                </h3>

                <div className="mt-3 space-y-3">
                  {clientDocuments.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      Nenhum documento enviado pelo cliente.
                    </div>
                  ) : (
                    clientDocuments.map((document) => (
                      <div
                        key={document.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <a
                              href={document.url ?? "#"}
                              target={document.url ? "_blank" : undefined}
                              aria-disabled={!document.url}
                              className={`font-medium underline ${
                                document.url
                                  ? "text-slate-950"
                                  : "pointer-events-none text-slate-400"
                              }`}
                            >
                              {document.file_name}
                            </a>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatFileSize(document.file_size)}
                            </p>
                          </div>

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            Cliente
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                          {documentSenderLabels[document.sender_type] ??
                            document.sender_type}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-950">
                  Enviados pelo escritório
                </h3>

                <div className="mt-3 space-y-3">
                  {lawyerDocuments.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      Nenhum documento enviado pelo escritório.
                    </div>
                  ) : (
                    lawyerDocuments.map((document) => (
                      <div
                        key={document.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <a
                              href={document.url ?? "#"}
                              target={document.url ? "_blank" : undefined}
                              aria-disabled={!document.url}
                              className={`font-medium underline ${
                                document.url
                                  ? "text-slate-950"
                                  : "pointer-events-none text-slate-400"
                              }`}
                            >
                              {document.file_name}
                            </a>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatFileSize(document.file_size)}
                            </p>
                          </div>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            Escritório
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Conversa do caso</h2>

            <div className="mt-4 space-y-3">
              {messages.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  Nenhuma mensagem registrada ainda.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {senderLabels[message.sender_type] ??
                          message.sender_type}
                      </span>

                      <span className="text-xs text-slate-400">
                        {new Date(message.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                      {message.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form action={sendCaseMessageAction} className="mt-5 space-y-3">
              <input type="hidden" name="caseId" value={legalCase.id} />

              <textarea
                name="content"
                required
                rows={4}
                placeholder="Escreva uma resposta para o cliente..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-950"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
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