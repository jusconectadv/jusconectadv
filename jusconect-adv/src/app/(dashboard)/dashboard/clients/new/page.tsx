import Link from "next/link";
import { createClientAction } from "@/src/services/clients";

type NewClientPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewClientPage({
  searchParams,
}: NewClientPageProps) {
  const params = await searchParams;

  return (
    <section className="max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Novo cliente</h1>
        <p className="mt-2 text-slate-600">
          Cadastre um cliente PF ou PJ no escritório.
        </p>
      </div>

      {params.error ? (
        <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </div>
      ) : null}

      <form
        action={createClientAction}
        className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            name="type"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          >
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nome
          </label>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            CPF/CNPJ
          </label>
          <input
            name="document"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Telefone
          </label>
          <input
            name="phone"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/clients"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Salvar cliente
          </button>
        </div>
      </form>
    </section>
  );
}