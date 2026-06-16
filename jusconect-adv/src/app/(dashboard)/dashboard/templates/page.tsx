import Link from "next/link";

import {
  createDocumentTemplateAction,
  deleteDocumentTemplateAction,
  listDocumentTemplates,
  updateDocumentTemplateStatusAction,
} from "@/src/services/document-templates";

type TemplatesPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
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
    checklist: "border-amber-200 bg-amber-50 text-amber-700",
    message: "border-cyan-200 bg-cyan-50 text-cyan-700",
    petition: "border-rose-200 bg-rose-50 text-rose-700",
    other: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return classes[category] ?? "border-slate-200 bg-slate-50 text-slate-700";
}

function getStatusClassName(isActive: boolean): string {
  if (isActive) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function getSuccessMessage(success: string | undefined): string | null {
  if (success === "template-created") {
    return "Template criado com sucesso.";
  }

  if (success === "template-activated") {
    return "Template ativado com sucesso.";
  }

  if (success === "template-deactivated") {
    return "Template desativado com sucesso.";
  }

  if (success === "template-deleted") {
    return "Template excluído com sucesso.";
  }

  return null;
}

function limitText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export default async function TemplatesPage({
  searchParams,
}: TemplatesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const templatesData = await listDocumentTemplates();
  const successMessage = getSuccessMessage(resolvedSearchParams.success);

  const activeTemplates = templatesData.templates.filter(
    (template) => template.is_active,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Sistema do escritório
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Templates
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Cadastre modelos internos para padronizar documentos, mensagens,
              checklists e textos usados nos atendimentos jurídicos.
            </p>
          </div>

          <Link
            href="/dashboard/cases"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Ver casos
          </Link>
        </header>

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {resolvedSearchParams.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total de templates
            </p>

            <strong className="mt-2 block text-3xl font-semibold text-slate-950">
              {templatesData.templates.length}
            </strong>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">Ativos</p>

            <strong className="mt-2 block text-3xl font-semibold text-emerald-700">
              {activeTemplates.length}
            </strong>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Inativos</p>

            <strong className="mt-2 block text-3xl font-semibold text-slate-950">
              {templatesData.templates.length - activeTemplates.length}
            </strong>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form
            action={createDocumentTemplateAction}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Novo template
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Crie um modelo reutilizável para o escritório.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Título *
                </label>

                <input
                  name="title"
                  required
                  placeholder="Ex: Procuração padrão"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Categoria
                </label>

                <select
                  name="category"
                  defaultValue="other"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="contract">Contrato</option>
                  <option value="power_of_attorney">Procuração</option>
                  <option value="declaration">Declaração</option>
                  <option value="checklist">Checklist</option>
                  <option value="message">Mensagem</option>
                  <option value="petition">Petição</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Descrição
                </label>

                <textarea
                  name="description"
                  rows={3}
                  placeholder="Explique quando este modelo deve ser usado."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Conteúdo *
                </label>

                <textarea
                  name="content"
                  required
                  rows={10}
                  placeholder={`Exemplo:\nEu, {cliente_nome}, autorizo...\n\nCaso: {caso_titulo}\nData: {data_atual}`}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm leading-6 text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300"
                />
                Template ativo
              </label>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h3 className="text-sm font-semibold text-blue-900">
                  Variáveis disponíveis
                </h3>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Na próxima fase esses modelos poderão usar variáveis como{" "}
                  <code>{"{cliente_nome}"}</code>,{" "}
                  <code>{"{caso_titulo}"}</code>,{" "}
                  <code>{"{caso_descricao}"}</code> e{" "}
                  <code>{"{data_atual}"}</code>.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Criar template
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Templates cadastrados
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {templatesData.templates.length} modelo(s) encontrado(s).
                </p>
              </div>
            </div>

            {templatesData.templates.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Nenhum template cadastrado.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Crie o primeiro modelo interno do escritório.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {templatesData.templates.map((template) => (
                  <article key={template.id} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getCategoryClassName(
                              template.category,
                            )}`}
                          >
                            {getCategoryLabel(template.category)}
                          </span>

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                              template.is_active,
                            )}`}
                          >
                            {template.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-semibold text-slate-950">
                          {template.title}
                        </h3>

                        {template.description ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {template.description}
                          </p>
                        ) : null}

                        <pre className="mt-4 max-h-40 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                          {limitText(template.content, 600)}
                        </pre>

                        <p className="mt-3 text-xs text-slate-500">
                          Criado em {formatDateTime(template.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <form action={updateDocumentTemplateStatusAction}>
                          <input
                            type="hidden"
                            name="templateId"
                            value={template.id}
                          />

                          <input
                            type="hidden"
                            name="nextStatus"
                            value={template.is_active ? "inactive" : "active"}
                          />

                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            {template.is_active ? "Desativar" : "Ativar"}
                          </button>
                        </form>

                        <form action={deleteDocumentTemplateAction}>
                          <input
                            type="hidden"
                            name="templateId"
                            value={template.id}
                          />

                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                          >
                            Excluir
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}