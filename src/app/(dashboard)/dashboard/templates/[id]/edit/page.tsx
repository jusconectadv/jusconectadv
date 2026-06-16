import Link from "next/link";

import {
  getDocumentTemplateById,
  updateDocumentTemplateAction,
} from "@/src/services/document-templates";

type EditTemplatePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
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

export default async function EditTemplatePage({
  params,
  searchParams,
}: EditTemplatePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { template } = await getDocumentTemplateById(resolvedParams.id);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="flex flex-col justify-between gap-6 p-7 md:flex-row md:items-end md:p-8">
          <div>
            <Link
              href="/dashboard/templates"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para templates
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Sistema do escritório
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Editar template
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Ajuste o conteúdo, categoria, descrição e status do modelo
              interno.
            </p>
          </div>

          <Link
            href="/dashboard/templates"
            className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
          >
            Biblioteca
          </Link>
        </div>
      </div>

      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Modelo atual
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                {template.title}
              </h2>
            </div>

            <div className="space-y-5 p-5 text-sm">
              <div>
                <p className="font-semibold text-[#5B6472]">Categoria</p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getCategoryClassName(
                    template.category,
                  )}`}
                >
                  {getCategoryLabel(template.category)}
                </span>
              </div>

              <div>
                <p className="font-semibold text-[#5B6472]">Status</p>

                <span
                  className={
                    template.is_active
                      ? "mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                      : "mt-2 inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                  }
                >
                  {template.is_active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div>
                <p className="font-semibold text-[#5B6472]">Descrição</p>

                <p className="mt-1 leading-6 text-[#0B1D2D]">
                  {template.description ?? "Sem descrição."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Variáveis disponíveis
            </p>

            <h3 className="mt-2 text-base font-bold text-[#0B1D2D]">
              Campos automáticos
            </h3>

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

        <form
          action={updateDocumentTemplateAction}
          className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
        >
          <input type="hidden" name="templateId" value={template.id} />

          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Edição
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Dados editáveis
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Revise o texto do modelo antes de salvar.
            </p>
          </div>

          <div className="grid gap-5 p-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Título *
              </label>

              <input
                id="title"
                name="title"
                required
                defaultValue={template.title}
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
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
                defaultValue={template.category}
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

              <p className="mt-2 text-xs text-[#5B6472]">
                Categoria atual: {getCategoryLabel(template.category)}
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Descrição
              </label>

              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={template.description ?? ""}
                placeholder="Explique quando este modelo deve ser usado."
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Conteúdo *
              </label>

              <textarea
                id="content"
                name="content"
                required
                rows={18}
                defaultValue={template.content}
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 font-mono text-sm leading-6 text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] px-4 py-3 text-sm font-semibold text-[#0B1D2D]">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={template.is_active}
                className="h-4 w-4 rounded border-[#D8D2C7]"
              />
              Template ativo
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#ECE7DD] bg-[#F8F6F1] p-5 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/templates"
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-5 py-3 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}