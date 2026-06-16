import Link from "next/link";
import { registerAction } from "@/src/app/(auth)/actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Criar conta</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cadastre-se para acessar o JUSCONECT ADV.
        </p>
      </div>

      {params.error ? (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </div>
      ) : null}

      <form action={registerAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nome completo
          </label>
          <input
            name="fullName"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tipo de conta
          </label>
          <select
            name="role"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          >
            <option value="client">Cliente</option>
            <option value="lawyer">Advogado</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nome do escritório
          </label>
          <input
            name="tenantName"
            type="text"
            placeholder="Obrigatório para advogado"
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
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Senha
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
        >
          Criar conta
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-slate-950">
          Entrar
        </Link>
      </p>
    </section>
  );
}