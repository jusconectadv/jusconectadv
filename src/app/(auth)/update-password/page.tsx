import Link from "next/link";

import { updatePasswordAction } from "@/src/app/(auth)/actions";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

type UpdatePasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const params = await searchParams;

  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-white shadow-2xl shadow-black/20">
        <div className="bg-[#0B1D2D] p-7 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C89B4A]">
            Recuperação de acesso
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Link inválido
          </h1>
        </div>

        <div className="p-7 md:p-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            O link de recuperação é inválido, já foi utilizado ou
            expirou.
          </div>

          <Link
            href="/forgot-password"
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-4 text-sm font-black text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
          >
            Solicitar novo link
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-white shadow-2xl shadow-black/20">
      <div className="bg-[#0B1D2D] p-7 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C89B4A]">
          Segurança da conta
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Criar nova senha
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#B8C2CC]">
          Defina uma nova senha para a conta{" "}
          <strong className="text-white">
            {user.email}
          </strong>
          .
        </p>
      </div>

      <div className="p-7 md:p-8">
        {params.error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {params.error}
          </div>
        ) : null}

        <form
          action={updatePasswordAction}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Nova senha
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Confirmar nova senha
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Digite novamente a nova senha"
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#C89B4A] px-5 py-4 text-sm font-black text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
          >
            Atualizar senha
          </button>
        </form>
      </div>
    </section>
  );
}