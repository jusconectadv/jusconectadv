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
    q?: string;
    category?: string;
    status?: string;
  }>;
};

type TemplateFilterStatus = "all" | "active" | "inactive";

const categoryOptions = [
  {
    value: "all",
    label: "Todas as categorias",
  },
  {
    value: "contract",
    label: "Contrato",
  },
  {
    value: "power_of_attorney",
    label: "Procuração",
  },
  {
    value: "declaration",
    label: "Declaração",
  },
  {
    value: "checklist",
    label: "Checklist",
  },
  {
    value: "message",
    label: "Mensagem",
  },
  {
    value: "petition",
    label: "Petição",
  },
  {
    value: "other",
    label: "Outro",
  },
] as const;

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
    checklist: "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]",
    message: "border-cyan-200 bg-cyan-50 text-cyan-700",
    petition: "border-rose-200 bg-rose-50 text-rose-700",
    other: "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]",
  };

  return classes[category] ?? "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
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

  if (success === "template-updated") {
    return "Template atualizado com sucesso.";
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

function normalizeSearch(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function getValidStatusFilter(status: string | undefined): TemplateFilterStatus {
  if (status === "active") {
    return "active";
  }

  if (status === "inactive") {
    return "inactive";
  }

  return "all";
}

function getValidCategoryFilter(category: string | undefined): string {
  const validCategories = categoryOptions.map((item) => item.value);

  if (category && validCategories.includes(category as never)) {
    return category;
  }

  return "all";
}

function templateMatchesSearch(
  template: {
    title: string;
    description: string | null;
    content: string;
    category: string;
  },
  search: string,
): boolean {
  if (!search) {
    return true;
  }

  return (
    template.title.toLowerCase().includes(search) ||
    (template.description ?? "").toLowerCase().includes(search) ||
    template.content.toLowerCase().includes(search) ||
    getCategoryLabel(template.category).toLowerCase().includes(search)
  );
}

function templateMatchesCategory(
  template: {
    category: string;
  },
  category: string,
): boolean {
  if (category === "all") {
    return true;
  }

  return template.category === category;
}

function templateMatchesStatus(
  template: {
    is_active: boolean;
  },
  status: TemplateFilterStatus,
): boolean {
  if (status === "active") {
    return template.is_active;
  }

  if (status === "inactive") {
    return !template.is_active;
  }

  return true;
}

export default async function TemplatesPage({
  searchParams,
}: TemplatesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const templatesData = await listDocumentTemplates();

  const successMessage = getSuccessMessage(resolvedSearchParams.success);
  const search = normalizeSearch(resolvedSearchParams.q);
  const selectedCategory = getValidCategoryFilter(resolvedSearchParams.category);
  const selectedStatus = getValidStatusFilter(resolvedSearchParams.status);

  const filteredTemplates = templatesData.templates.filter(
    (template) =>
      templateMatchesSearch(template, search) &&
      templateMatchesCategory(template, selectedCategory) &&
      templateMatchesStatus(template, selectedStatus),
  );

  const activeTemplates = templatesData.templates.filter(
    (template) => template.is_active,
  );

  const inactiveTemplates = templatesData.templates.filter(
    (template) => !template.is_active,
  );

  const filteredActiveTemplates = filteredTemplates.filter(
    (template) => template.is_active,
  );

  const hasFilters =
    search.length > 0 ||
    selectedCategory !== "all" ||
    selectedStatus !== "all";

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Sistema do escritório
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Templates
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Cadastre modelos internos para padronizar documentos, mensagens,
              checklists, petições e textos usados nos atendimentos jurídicos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/cases"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
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
                Resumo dos modelos
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Total</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {templatesData.templates.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Ativos</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {activeTemplates.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Inativos</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {inactiveTemplates.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Filtrados</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {filteredTemplates.length}
                  </p>
                </div>
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

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">
            Total de templates
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {templatesData.templates.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Modelos cadastrados
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">Ativos</p>

          <strong className="mt-2 block text-3xl font-bold text-emerald-700">
            {activeTemplates.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Disponíveis para uso
          </p>
        </div>

        <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-700">Inativos</p>

          <strong className="mt-2 block text-3xl font-bold text-red-700">
            {inactiveTemplates.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Ocultos temporariamente
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Filtrados</p>

          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {filteredTemplates.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            {filteredActiveTemplates.length} ativo(s)
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Pesquisa
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Buscar e filtrar templates
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Encontre modelos por título, categoria, descrição ou conteúdo.
            </p>
          </div>

          {hasFilters ? (
            <Link
              href="/dashboard/templates"
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Limpar filtros
            </Link>
          ) : null}
        </div>

        <form className="grid gap-4 p-5 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto] lg:items-end">
          <div>
            <label
              htmlFor="q"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Busca
            </label>

            <input
              id="q"
              name="q"
              type="search"
              defaultValue={resolvedSearchParams.q ?? ""}
              placeholder="Procure por procuração, contrato, mensagem..."
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Categoria
            </label>

            <select
              id="category"
              name="category"
              defaultValue={selectedCategory}
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            >
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={selectedStatus}
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#0B1D2D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
          >
            Aplicar
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          action={createDocumentTemplateAction}
          className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
        >
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Novo modelo
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Criar template
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#5B6472]">
              Crie um modelo reutilizável para documentos, mensagens e peças do
              escritório.
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                Título *
              </label>

              <input
                name="title"
                required
                placeholder="Ex: Procuração padrão"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                Categoria
              </label>

              <select
                name="category"
                defaultValue="other"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
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
              <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                Descrição
              </label>

              <textarea
                name="description"
                rows={3}
                placeholder="Explique quando este modelo deve ser usado."
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                Conteúdo *
              </label>

              <textarea
                name="content"
                required
                rows={10}
                placeholder={`Exemplo:\nEu, {cliente_nome}, autorizo...\n\nCaso: {caso_titulo}\nData: {data_atual}`}
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 font-mono text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] px-4 py-3 text-sm font-semibold text-[#0B1D2D]">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="h-4 w-4 rounded border-[#D8D2C7]"
              />
              Template ativo
            </label>

            <div className="rounded-2xl border border-[#E7D7B5] bg-[#FFF8E8] p-4">
              <h3 className="text-sm font-bold text-[#0B1D2D]">
                Variáveis disponíveis
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
                Use variáveis como <code>{"{cliente_nome}"}</code>,{" "}
                <code>{"{caso_titulo}"}</code>,{" "}
                <code>{"{caso_descricao}"}</code> e{" "}
                <code>{"{data_atual}"}</code>.
              </p>
            </div>
          </div>

          <div className="border-t border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <button
              type="submit"
              className="w-full rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Criar template
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Modelos cadastrados
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Biblioteca de templates
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                {filteredTemplates.length} de {templatesData.templates.length}{" "}
                modelo(s) exibido(s).
              </p>
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-bold text-[#0B1D2D]">
                Nenhum template encontrado.
              </p>

              <p className="mt-1 text-sm text-[#5B6472]">
                Ajuste os filtros ou crie um novo modelo interno.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {filteredTemplates.map((template) => (
                <article
                  key={template.id}
                  className="p-5 transition hover:bg-[#F8F6F1]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getCategoryClassName(
                            template.category,
                          )}`}
                        >
                          {getCategoryLabel(template.category)}
                        </span>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClassName(
                            template.is_active,
                          )}`}
                        >
                          {template.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-[#0B1D2D]">
                        {template.title}
                      </h3>

                      {template.description ? (
                        <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                          {template.description}
                        </p>
                      ) : null}

                      <pre className="mt-4 max-h-40 overflow-auto rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] p-4 text-xs leading-6 text-[#0B1D2D]">
                        {limitText(template.content, 600)}
                      </pre>

                      <p className="mt-3 text-xs text-[#8FA0AE]">
                        Criado em {formatDateTime(template.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Link
                        href={`/dashboard/templates/${template.id}/edit`}
                        className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                      >
                        Editar
                      </Link>

                      <form action={updateDocumentTemplateStatusAction}>
                        <input
                          type="hidden"
                          name="templateId"
                          value={template.id}
                        />

                        <input
                          type="hidden"
                          name="isActive"
                          value={template.is_active ? "false" : "true"}
                        />

                        <button
                          type="submit"
                          className={
                            template.is_active
                              ? "inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                              : "inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          }
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
                          className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
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
  );
}