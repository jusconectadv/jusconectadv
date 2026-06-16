import Link from "next/link";

import { createAuthenticatedClientCaseAction } from "@/src/services/client-dashboard";

type NewClientCasePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewClientCasePage({
  searchParams,
}: NewClientCasePageProps) {
  const query = await searchParams;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="flex flex-col justify-between gap-6 p-7 md:flex-row md:items-end md:p-8">
          <div>
            <Link
              href="/dashboard/client"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para meus atendimentos
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Portal do cliente
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Novo atendimento
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Descreva sua solicitação para o escritório. Depois de abrir o
              atendimento, você poderá enviar documentos e acompanhar as
              mensagens pelo portal.
            </p>
          </div>

          <Link
            href="/dashboard/client"
            className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
          >
            Meus atendimentos
          </Link>
        </div>
      </div>

      {query.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {query.error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Orientação
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Como preencher
              </h2>
            </div>

            <div className="space-y-4 p-5 text-sm leading-6 text-[#5B6472]">
              <p>
                Informe um título objetivo e descreva o caso com o máximo de
                detalhes possível.
              </p>

              <p>
                Inclua datas importantes, pessoas envolvidas, documentos que já
                possui e o que deseja resolver.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Depois do envio
            </p>

            <h3 className="mt-2 text-base font-bold text-[#0B1D2D]">
              Acompanhamento online
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
              Após abrir o atendimento, você será direcionado para a página do
              caso. Lá será possível enviar documentos e continuar a conversa
              com o escritório.
            </p>
          </div>
        </aside>

        <form
          action={createAuthenticatedClientCaseAction}
          className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
        >
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Solicitação
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Dados do atendimento
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              As informações abaixo serão enviadas ao escritório.
            </p>
          </div>

          <div className="grid gap-5 p-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Título do atendimento *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Ex: Revisão de contrato, problema trabalhista, cobrança indevida..."
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
                defaultValue="medium"
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
                Descrição do caso *
              </label>

              <textarea
                id="description"
                name="description"
                required
                rows={9}
                placeholder="Explique o que aconteceu, datas importantes, pessoas envolvidas, documentos que possui e o que deseja resolver."
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#ECE7DD] bg-[#F8F6F1] p-5 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/client"
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-5 py-3 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Abrir atendimento
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}