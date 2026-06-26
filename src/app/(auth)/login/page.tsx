import Link from "next/link";

import { loginAction } from "@/src/app/(auth)/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  return (
    <section className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-white shadow-2xl shadow-black/20">
      <div className="bg-[#0B1D2D] p-7 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C89B4A]">
          JUSCONECT ADV
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Entrar
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#B8C2CC]">
          Acesse sua conta para acompanhar seus atendimentos ou
          administrar o escritório.
        </p>
      </div>

      <div className="p-7 md:p-8">
        {params.error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {params.error}
          </div>
        ) : null}

        {params.success ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {params.success}
          </div>
        ) : null}

        <form
          action={loginAction}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              E-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="seu@email.com"
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-[#0B1D2D]"
              >
                Senha
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-bold text-[#9E762D] transition hover:text-[#C89B4A]"
              >
                Esqueci minha senha
              </Link>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Digite sua senha"
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#0B1D2D] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#132D44]"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 border-t border-[#ECE7DD] pt-6 text-center">
          <p className="text-sm text-[#5B6472]">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="font-bold text-[#0B1D2D] transition hover:text-[#9E762D]"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}