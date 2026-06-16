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
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Link
            href="/dashboard/client"
            className="text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            ← Voltar para meus atendimentos
          </Link>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Portal do cliente
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Novo atendimento
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Descreva sua solicitação para o escritório. Depois de abrir o
            atendimento, você poderá enviar documentos e acompanhar as mensagens
            pelo portal.
          </p>
        </header>

        {query.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {query.error}
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form action={createAuthenticatedClientCaseAction} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700"
              >
                Título do atendimento *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Ex: Revisão de contrato, problema trabalhista, cobrança indevida..."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950"
              />
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-slate-700"
              >
                Prioridade
              </label>

              <select
                id="priority"
                name="priority"
                defaultValue="medium"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950"
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
                className="block text-sm font-medium text-slate-700"
              >
                Descrição do caso *
              </label>

              <textarea
                id="description"
                name="description"
                required
                rows={8}
                placeholder="Explique o que aconteceu, datas importantes, pessoas envolvidas, documentos que possui e o que deseja resolver."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950"
              />
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h2 className="text-sm font-semibold text-blue-900">
                Depois do envio
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Após abrir o atendimento, você será direcionado para a página do
                caso. Lá será possível enviar documentos e continuar a conversa
                com o escritório.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard/client"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Abrir atendimento
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}