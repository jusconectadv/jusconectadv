import Link from "next/link";

import { CopyGeneratedTemplateButton } from "@/src/components/cases/CopyGeneratedTemplateButton";
import { CasePriorityBadge } from "@/src/components/cases/CasePriorityBadge";
import { CaseStatusBadge } from "@/src/components/cases/CaseStatusBadge";
import { getCaseTemplateRendererData } from "@/src/services/case-template-renderer";

type CaseTemplatesPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    templateId?: string;
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Link
            href={`/dashboard/cases/${data.legal_case.id}`}
            className="text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            ← Voltar para o caso
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Gerador de texto
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Usar template no caso
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Selecione um modelo interno e gere um texto preenchido com os
                dados do cliente e do atendimento.
              </p>
            </div>

            <Link
              href="/dashboard/templates"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Gerenciar templates
            </Link>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-950">
              Dados usados
            </h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Cliente</dt>
                <dd className="mt-1 text-slate-950">{data.client.name}</dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Caso</dt>
                <dd className="mt-1 text-slate-950">
                  {data.legal_case.title}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Status</dt>
                <dd className="mt-2">
                  <CaseStatusBadge status={data.legal_case.status} />
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Prioridade</dt>
                <dd className="mt-2">
                  <CasePriorityBadge priority={data.legal_case.priority} />
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Criado em</dt>
                <dd className="mt-1 text-slate-950">
                  {formatDateTime(data.legal_case.created_at)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-950">
              Escolher template
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Apenas templates ativos aparecem nesta lista.
            </p>

            {data.templates.length === 0 ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-sm font-semibold text-amber-900">
                  Nenhum template ativo
                </h3>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Crie um template ativo para gerar textos a partir dos dados do
                  caso.
                </p>

                <Link
                  href="/dashboard/templates"
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-amber-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
                >
                  Criar template
                </Link>
              </div>
            ) : (
              <form className="mt-5 flex flex-col gap-3 md:flex-row">
                <select
                  name="templateId"
                  defaultValue={data.selected_template?.id ?? ""}
                  className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="">Selecione um template</option>

                  {data.templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title} — {getCategoryLabel(template.category)}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Gerar texto
                </button>
              </form>
            )}

            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-900">
                Variáveis disponíveis
              </h3>

              <div className="mt-3 grid gap-2 text-xs text-blue-800 md:grid-cols-2">
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
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Texto gerado
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Copie o texto abaixo e use em documentos, mensagens ou editores
                externos.
              </p>
            </div>

            {data.rendered_content ? (
              <CopyGeneratedTemplateButton text={data.rendered_content} />
            ) : null}
          </div>

          <div className="p-5">
            {data.rendered_content ? (
              <textarea
                readOnly
                value={data.rendered_content}
                rows={18}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm leading-6 text-slate-900 outline-none"
              />
            ) : (
              <div className="rounded-xl bg-slate-50 p-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Nenhum texto gerado ainda.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Selecione um template acima e clique em “Gerar texto”.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}