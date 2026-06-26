import Link from "next/link";

import { RegisterForm } from "@/src/components/forms/RegisterForm";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  return (
    <section className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-white shadow-2xl shadow-black/20">
      <div className="bg-[#0B1D2D] p-7 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C89B4A]">
          JUSCONECT ADV
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Criar conta
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#B8C2CC]">
          Crie seu acesso para acompanhar atendimentos jurídicos ou
          administrar seu escritório pela plataforma.
        </p>
      </div>

      <div className="p-7 md:p-8">
        {params.error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {params.error}
          </div>
        ) : null}

        <RegisterForm />

        <div className="mt-7 border-t border-[#ECE7DD] pt-6 text-center">
          <p className="text-sm text-[#5B6472]">
            Já possui uma conta?{" "}
            <Link
              href="/login"
              className="font-bold text-[#0B1D2D] transition hover:text-[#9E762D]"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}