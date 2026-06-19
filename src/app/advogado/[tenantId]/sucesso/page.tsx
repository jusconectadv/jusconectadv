import Link from "next/link";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";

type PublicSuccessPageProps = {
  params: Promise<{
    tenantId: string;
  }>;
};

export default async function PublicSuccessPage({
  params,
}: PublicSuccessPageProps) {
  const { tenantId } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = Boolean(user);

  const dashboardHref = isLoggedIn
    ? "/dashboard/client"
    : `/login?success=${encodeURIComponent(
        "Seu atendimento foi enviado. Entre na sua conta para acompanhar.",
      )}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B1D2D] px-4 py-10">
      <section className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#C89B4A]/30 bg-white shadow-2xl shadow-black/30">
        <div className="bg-[#0B1D2D] px-8 py-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#C89B4A]/40 bg-[#C89B4A] text-4xl font-black text-[#0B1D2D]">
            ✓
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#C89B4A]">
            Atendimento recebido
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Solicitação enviada com sucesso
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#C5CED7]">
            O escritório recebeu seus dados e as informações do atendimento
            para realizar a análise inicial.
          </p>
        </div>

        <div className="bg-[#F8F6F1] p-8">
          <div className="rounded-2xl border border-[#E7D7B5] bg-[#FFF8E8] p-5">
            <h2 className="text-base font-bold text-[#0B1D2D]">
              Acompanhe tudo pelo seu painel
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6A5733]">
              Você poderá acompanhar o andamento do caso, receber mensagens do
              escritório, consultar documentos e enviar novas informações.
            </p>
          </div>

          {!isLoggedIn ? (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm leading-6 text-blue-800">
                Sua conta foi criada, mas talvez seja necessário confirmar o
                e-mail ou entrar novamente antes de acessar o painel.
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={dashboardHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-center text-sm font-black text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              {isLoggedIn ? "Acessar meu painel" : "Entrar para acompanhar"}
            </Link>

            <Link
              href={`/advogado/${tenantId}`}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#0B1D2D] bg-white px-5 py-3 text-center text-sm font-bold text-[#0B1D2D] transition hover:bg-[#EEF1F3]"
            >
              Enviar outro atendimento
            </Link>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-[#6B7280]">
            Guarde seus dados de acesso. Eles poderão ser usados para acompanhar
            este e outros atendimentos no JUSCONECT ADV.
          </p>
        </div>
      </section>
    </main>
  );
}