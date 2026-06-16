import Link from "next/link";

import { CopyGeneratedTemplateButton } from "@/src/components/cases/CopyGeneratedTemplateButton";
import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import {
  getCaseTemplateRendererData,
  saveGeneratedTemplateAsNoteAction,
  sendGeneratedTemplateAsMessageAction,
} from "@/src/services/case-template-renderer";

type CaseTemplatesPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    templateId?: string;
    error?: string;
    success?: string;
  }>;
};

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    contract: "Contrato",
    power_of_attorney: "Procuração",
    declaration: "Declaração",
    checklist: "Checklist",
    message: "Mensagem",
    petition: "Petição",
    other: "Outro",
  };

  return labels[category] ?? "Outro";
}

function getCategoryClassName(category: string): string {
  const classes: Record<string, string> = {
    contract: "border-blue-200 bg-blue-50 text-blue-700",
    power_of_attorney: "border-purple-200 bg-purple-50 text-purple-700",
    declaration: "border-emerald-200 bg-emerald-50 text-emerald-700",
    checklist: "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]",
    message: "border-cyan-200 bg-cyan-50 text-cyan-700",
    petition: "border-rose-200 bg-rose-50 text-rose-700",
    other: "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]",
  };

  return classes[category] ?? "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
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

function getSuccessMessage(success: string | undefined): string | null {
  if (success === "note-created") {
    return "Texto gerado salvo como nota interna do caso.";
  }

  if (success === "message-sent") {
    return "Texto gerado enviado como mensagem para o cliente.";
  }

  return null;
}

export default async function CaseTemplatesPage({
  params,
  searchParams,
}: CaseTemplatesPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const data = await getCaseTemplateRendererData({
    caseId: resolvedParams.id,
    templateId: resolvedSearchParams.templateId,
  });

  const successMessage = getSuccessMessage(resolvedSearchParams.success);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <Link
              href={`/dashboard/cases/${data.legal_case.id}`}
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para o caso
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Gerador de texto
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Usar template no caso
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Selecione um modelo interno e gere um texto preenchido com dados
              do cliente, do caso e do escritório.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/dashboard/cases/${data.legal_case.id}`}
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Abrir caso
              </Link>

              <Link
                href="/dashboard/templates"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Gerenciar templates
              </Link>

              <Link
                href="/dashboard/search"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Buscar dados
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Dados do caso
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA0AE]">
                    Cliente
                  </p>
                  <p className="mt-1 font-bold text-white">
                    {data.client.name}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA0AE]">
                    Caso
                  </p>
                  <p className="mt-1 font-bold text-white">
                    {data.legal_case.title}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <CaseStatusBadge status={data.legal_case.status} />
                  <CasePriorityBadge priority={data.legal_case.priority} />
                </div>

                <p className="text-xs text-[#8FA0AE]">
                  Criado em {formatDateTime(data.legal_case.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Contexto
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Dados usados
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Estas informações serão usadas para preencher as variáveis do
                modelo selecionado.
              </p>
            </div>

            <dl className="space-y-5 p-5 text-sm">
              <div>
                <dt className="font-semibold text-[#5B6472]">Cliente</dt>
                <dd className="mt-1 font-bold text-[#0B1D2D]">
                  {data.client.name}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">Caso</dt>
                <dd className="mt-1 text-[#0B1D2D]">
                  {data.legal_case.title}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">Status</dt>
                <dd className="mt-2">
                  <CaseStatusBadge status={data.legal_case.status} />
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">Prioridade</dt>
                <dd className="mt-2">
                  <CasePriorityBadge priority={data.legal_case.priority} />
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">Criado em</dt>
                <dd className="mt-1 text-[#0B1D2D]">
                  {formatDateTime(data.legal_case.created_at)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Variáveis disponíveis
            </p>

            <h3 className="mt-2 text-base font-bold text-[#0B1D2D]">
              Campos automáticos
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
              Use os modelos com variáveis para preencher dados do cliente, caso
              e escritório automaticamente.
            </p>

            <div className="mt-4 grid gap-2 text-xs text-[#7A5B24]">
              <code>{"{cliente_nome}"}</code>
              <code>{"{cliente_tipo}"}</code>
              <code>{"{cliente_documento}"}</code>
              <code>{"{cliente_email}"}</code>
              <code>{"{cliente_telefone}"}</code>
              <code>{"{caso_titulo}"}</code>
              <code>{"{caso_descricao}"}</code>
              <code>{"{caso_status}"}</code>
              <code>{"{caso_prioridade}"}</code>
              <code>{"{data_atual}"}</code>
              <code>{"{tenant_nome}"}</code>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Seleção
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Escolher template
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#5B6472]">
                Apenas templates ativos aparecem nesta lista.
              </p>
            </div>

            <div className="p-5">
              {data.templates.length === 0 ? (
                <div className="rounded-2xl border border-[#E7D7B5] bg-[#FFF8E8] p-5">
                  <h3 className="text-sm font-bold text-[#0B1D2D]">
                    Nenhum template ativo
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
                    Crie um template ativo para gerar textos a partir dos dados
                    do caso.
                  </p>

                  <Link
                    href="/dashboard/templates"
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
                  >
                    Criar template
                  </Link>
                </div>
              ) : (
                <form className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <select
                    name="templateId"
                    defaultValue={data.selected_template?.id ?? ""}
                    className="min-h-12 rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                  >
                    <option value="">Selecione um template</option>

                    {data.templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title} —{" "}
                        {getCategoryLabel(template.category)}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#0B1D2D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
                  >
                    Gerar texto
                  </button>
                </form>
              )}

              {data.selected_template ? (
                <div className="mt-5 rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getCategoryClassName(
                        data.selected_template.category,
                      )}`}
                    >
                      {getCategoryLabel(data.selected_template.category)}
                    </span>

                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Template selecionado
                    </span>
                  </div>

                  <h3 className="mt-3 font-bold text-[#0B1D2D]">
                    {data.selected_template.title}
                  </h3>

                  {data.selected_template.description ? (
                    <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                      {data.selected_template.description}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                  Resultado
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                  Texto gerado
                </h2>

                <p className="mt-1 text-sm text-[#5B6472]">
                  Copie, salve como nota interna ou envie como mensagem para o
                  cliente.
                </p>
              </div>

              {data.rendered_content && data.selected_template ? (
                <div className="flex flex-wrap gap-2">
                  <CopyGeneratedTemplateButton text={data.rendered_content} />

                  <form action={saveGeneratedTemplateAsNoteAction}>
                    <input
                      type="hidden"
                      name="caseId"
                      value={data.legal_case.id}
                    />

                    <input
                      type="hidden"
                      name="templateId"
                      value={data.selected_template.id}
                    />

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                    >
                      Salvar como nota
                    </button>
                  </form>

                  <form action={sendGeneratedTemplateAsMessageAction}>
                    <input
                      type="hidden"
                      name="caseId"
                      value={data.legal_case.id}
                    />

                    <input
                      type="hidden"
                      name="templateId"
                      value={data.selected_template.id}
                    />

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Enviar ao cliente
                    </button>
                  </form>
                </div>
              ) : null}
            </div>

            <div className="p-5">
              {data.rendered_content ? (
                <textarea
                  readOnly
                  value={data.rendered_content}
                  rows={20}
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] px-4 py-3 font-mono text-sm leading-7 text-[#0B1D2D] outline-none"
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-8 text-center">
                  <p className="text-sm font-bold text-[#0B1D2D]">
                    Nenhum texto gerado ainda.
                  </p>

                  <p className="mt-2 text-sm text-[#5B6472]">
                    Selecione um template acima e clique em “Gerar texto”.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}