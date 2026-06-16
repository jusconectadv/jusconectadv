import Link from "next/link";
import { notFound } from "next/navigation";

import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import {
  getClientPortalDocumentUrl,
  sendClientMessageAction,
  uploadClientDocumentAction,
} from "@/src/services/client-portal";
import type { Database } from "@/src/types/supabase";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type CaseDocumentRow = Database["public"]["Tables"]["case_documents"]["Row"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];
type TenantPublicSettingsRow =
  Database["public"]["Tables"]["tenant_public_settings"]["Row"];

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

type DocumentWithUrl = CaseDocumentRow & {
  url: string | null;
};

type PortalData = {
  legalCase: CaseRow;
  client: ClientRow | null;
  tenant: TenantRow | null;
  publicSettings: TenantPublicSettingsRow | null;
  messages: MessageRow[];
  documents: DocumentWithUrl[];
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

function getWhatsappUrl(number: string | null): string | null {
  if (!number) {
    return null;
  }

  const cleanNumber = number.replace(/\D/g, "");

  if (!cleanNumber) {
    return null;
  }

  return `https://wa.me/${cleanNumber}`;
}

function getMessageBubbleClassName(senderType: string): string {
  if (senderType === "client") {
    return "border-blue-100 bg-blue-50";
  }

  if (senderType === "lawyer") {
    return "border-emerald-100 bg-emerald-50";
  }

  return "border-slate-200 bg-slate-50";
}

function getMessageLabelClassName(senderType: string): string {
  if (senderType === "client") {
    return "text-blue-700";
  }

  if (senderType === "lawyer") {
    return "text-emerald-700";
  }

  return "text-slate-600";
}

function getDocumentBadgeClassName(senderType: string): string {
  if (senderType === "client") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (senderType === "lawyer") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

async function getPortalData(token: string): Promise<PortalData> {
  const supabase = createSupabaseAdminClient();

  const { data: legalCase, error: legalCaseError } = await supabase
    .from("cases")
    .select("*")
    .eq("public_token", token)
    .single();

  if (legalCaseError || !legalCase) {
    notFound();
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", legalCase.client_id)
    .eq("tenant_id", legalCase.tenant_id)
    .maybeSingle();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", legalCase.tenant_id)
    .maybeSingle();

  const { data: publicSettings } = await supabase
    .from("tenant_public_settings")
    .select("*")
    .eq("tenant_id", legalCase.tenant_id)
    .maybeSingle();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("case_id", legalCase.id)
    .eq("tenant_id", legalCase.tenant_id)
    .order("created_at", { ascending: true });

  const { data: documents } = await supabase
    .from("case_documents")
    .select("*")
    .eq("case_id", legalCase.id)
    .eq("tenant_id", legalCase.tenant_id)
    .order("created_at", { ascending: false });

  const documentsWithUrls: DocumentWithUrl[] = await Promise.all(
    (documents ?? []).map(async (document) => ({
      ...document,
      url: document.storage_path
        ? await getClientPortalDocumentUrl(document.storage_path)
        : null,
    })),
  );

  return {
    legalCase,
    client: client ?? null,
    tenant: tenant ?? null,
    publicSettings: publicSettings ?? null,
    messages: messages ?? [],
    documents: documentsWithUrls,
  };
}

export default async function ClientPortalPage({
  params,
  searchParams,
}: Props) {
  const { token } = await params;
  const query = await searchParams;

  const data = await getPortalData(token);

  const legalCase = data.legalCase;
  const client = data.client;
  const tenant = data.tenant;
  const publicSettings = data.publicSettings;
  const messages = data.messages;
  const documents = data.documents;

  const whatsappUrl = getWhatsappUrl(publicSettings?.whatsapp_number ?? null);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Acompanhamento do atendimento
              </p>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                {legalCase.title}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Acompanhe o andamento do seu atendimento, envie mensagens ao
                escritório e anexe documentos relacionados ao caso.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <CaseStatusBadge status={legalCase.status} />
              <CasePriorityBadge priority={legalCase.priority} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Escritório
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {tenant?.name ?? "Escritório jurídico"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Cliente
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {client?.name ?? "Não informado"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Criado em
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {formatDateTime(legalCase.created_at)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 md:flex-row">
            <Link
              href={`/advogado/${legalCase.tenant_id}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Voltar ao formulário
            </Link>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                Falar no WhatsApp
              </a>
            ) : null}
          </div>
        </header>

        {query.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {query.error}
          </div>
        ) : null}

        {query.success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            Operação realizada com sucesso.
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-3">
          <aside className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Resumo do atendimento
              </h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-slate-500">Status</dt>
                  <dd className="mt-2">
                    <CaseStatusBadge status={legalCase.status} />
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-slate-500">Prioridade</dt>
                  <dd className="mt-2">
                    <CasePriorityBadge priority={legalCase.priority} />
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-slate-500">
                    Descrição inicial
                  </dt>
                  <dd className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-slate-800">
                    {legalCase.description ?? "Sem descrição."}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-slate-500">
                    Código de acompanhamento
                  </dt>
                  <dd className="mt-2 break-all rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-700">
                    {token}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Enviar documento
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Envie provas, PDFs, imagens, contratos ou documentos
                relacionados ao atendimento.
              </p>

              <form
                action={uploadClientDocumentAction}
                className="mt-5 space-y-3"
              >
                <input type="hidden" name="token" value={token} />

                <input
                  type="file"
                  name="file"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Enviar documento
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h2 className="text-sm font-semibold text-blue-900">
                Informações privadas
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Notas internas, tarefas e prazos administrativos são privados do
                escritório e não aparecem nesta área do cliente.
              </p>
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-950">
                  Conversa do atendimento
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Use este espaço para responder ao escritório e acompanhar as
                  mensagens recebidas.
                </p>
              </div>

              <div className="space-y-4 p-6">
                {messages.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
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
                          className={`text-xs font-semibold uppercase tracking-wide ${getMessageLabelClassName(
                            message.sender_type,
                          )}`}
                        >
                          {senderLabels[message.sender_type] ??
                            message.sender_type}
                        </span>

                        <span className="text-xs text-slate-500">
                          {formatDateTime(message.created_at)}
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                        {message.content}
                      </p>
                    </article>
                  ))
                )}
              </div>

              <form
                action={sendClientMessageAction}
                className="border-t border-slate-200 p-6"
              >
                <input type="hidden" name="token" value={token} />

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nova mensagem
                </label>

                <textarea
                  name="content"
                  required
                  rows={4}
                  placeholder="Digite sua mensagem para o escritório..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Enviar mensagem
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-950">
                  Documentos do caso
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Arquivos enviados por você ou pelo escritório durante o
                  atendimento.
                </p>
              </div>

              <div className="space-y-3 p-6">
                {documents.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    Nenhum documento enviado ainda.
                  </div>
                ) : (
                  documents.map((document) => (
                    <article
                      key={document.id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-start md:justify-between"
                    >
                      <div className="min-w-0">
                        <a
                          href={document.url ?? "#"}
                          target={document.url ? "_blank" : undefined}
                          aria-disabled={!document.url}
                          className={`font-semibold underline ${
                            document.url
                              ? "text-slate-950 hover:text-slate-700"
                              : "pointer-events-none text-slate-400"
                          }`}
                        >
                          {document.file_name}
                        </a>

                        <p className="mt-2 text-xs text-slate-500">
                          {formatFileSize(document.file_size)} •{" "}
                          {formatDateTime(document.created_at)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {documentSenderLabels[document.sender_type] ??
                            document.sender_type}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${getDocumentBadgeClassName(
                          document.sender_type,
                        )}`}
                      >
                        {document.sender_type === "client"
                          ? "Você"
                          : "Escritório"}
                      </span>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}