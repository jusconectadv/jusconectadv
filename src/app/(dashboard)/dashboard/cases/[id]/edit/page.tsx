import Link from "next/link";

import { getEditableCase, updateCaseDetailsAction } from "@/src/services/case-edit";

type EditCasePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
  };

  return labels[priority] ?? "Média";
}

function getPriorityClassName(priority: string): string {
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

export default async function EditCasePage({
  params,
  searchParams,
}: EditCasePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const data = await getEditableCase(resolvedParams.id);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="flex flex-col justify-between gap-6 p-7 md:flex-row md:items-end md:p-8">
          <div>
            <Link
              href={`/dashboard/cases/${data.legal_case.id}`}
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para o caso
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Atendimento jurídico
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Editar caso
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Atualize as informações principais do atendimento. O cliente
              vinculado e o status não são alterados nesta tela.
            </p>
          </div>

          <Link
            href={`/dashboard/cases/${data.legal_case.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
          >
            Abrir caso
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
                Dados atuais
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Resumo do atendimento
              </h2>
            </div>

            <dl className="space-y-5 p-5 text-sm">
              <div>
                <dt className="font-semibold text-[#5B6472]">Cliente</dt>

                <dd className="mt-1">
                  <Link
                    href={`/dashboard/clients/${data.client.id}`}
                    className="font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                  >
                    {data.client.name}
                  </Link>
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">E-mail</dt>
                <dd className="mt-1 text-[#0B1D2D]">
                  {data.client.email ?? "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">Telefone</dt>
                <dd className="mt-1 text-[#0B1D2D]">
                  {data.client.phone ?? "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">
                  Prioridade atual
                </dt>

                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getPriorityClassName(
                      data.legal_case.priority,
                    )}`}
                  >
                    {getPriorityLabel(data.legal_case.priority)}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Observação
            </p>

            <h3 className="mt-2 text-base font-bold text-[#0B1D2D]">
              Status do caso
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
              Para alterar o status do caso, volte ao detalhe do atendimento e
              use os botões de fluxo ou o Kanban.
            </p>
          </div>
        </aside>

        <form
          action={updateCaseDetailsAction}
          className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
        >
          <input type="hidden" name="caseId" value={data.legal_case.id} />

          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Atualização
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Dados editáveis do caso
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Revise o título, prioridade e descrição antes de salvar.
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
                defaultValue={data.legal_case.title}
                placeholder="Ex: Revisão contratual, problema trabalhista..."
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div>
              <label
                htmlFor="priority"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Prioridade
              </label>

              <select
                id="priority"
                name="priority"
                defaultValue={data.legal_case.priority}
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Descrição *
              </label>

              <textarea
                id="description"
                name="description"
                required
                rows={12}
                defaultValue={data.legal_case.description ?? ""}
                placeholder="Descreva o caso com detalhes."
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#ECE7DD] bg-[#F8F6F1] p-5 sm:flex-row sm:justify-end">
            <Link
              href={`/dashboard/cases/${data.legal_case.id}`}
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