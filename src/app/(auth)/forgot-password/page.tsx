import Link from "next/link";

import { requestPasswordResetAction } from "@/src/app/(auth)/actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <section className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-white shadow-2xl shadow-black/20">
      <div className="bg-[#0B1D2D] p-7 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C89B4A]">
          Recuperação de acesso
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Esqueci minha senha
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#B8C2CC]">
          Informe o e-mail utilizado para acessar o JUSCONECT
          ADV.
        </p>
      </div>

      <div className="p-7 md:p-8">
        {params.error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {params.error}
          </div>
        ) : null}

        {params.success ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
            {params.success}
          </div>
        ) : null}

        {!params.success ? (
          <form
            action={requestPasswordResetAction}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                E-mail de acesso
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

              <p className="mt-2 text-xs leading-5 text-[#5B6472]">
                Enviaremos um link para você cadastrar uma nova
                senha.
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#C89B4A] px-5 py-4 text-sm font-black text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Enviar link de recuperação
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#0B1D2D] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#132D44]"
          >
            Voltar para o login
          </Link>
        )}

        {!params.success ? (
          <div className="mt-6 border-t border-[#ECE7DD] pt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-bold text-[#0B1D2D] transition hover:text-[#9E762D]"
            >
              Voltar para o login
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}