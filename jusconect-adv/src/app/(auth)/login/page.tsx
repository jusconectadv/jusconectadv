import Link from "next/link";
import { loginAction } from "@/src/app/(auth)/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Acesse sua conta JUSCONECT ADV.
        </p>
      </div>

      {params.error ? (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </div>
      ) : null}

      {params.success ? (
        <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {params.success}
        </div>
      ) : null}

      <form action={loginAction} className="space-y-4">
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
        >
          Entrar
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Não tem conta?{" "}
        <Link href="/register" className="font-medium text-slate-950">
          Criar conta
        </Link>
      </p>
    </section>
  );
}