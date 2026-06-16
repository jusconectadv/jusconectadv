import Link from "next/link";

type PublicSuccessPageProps = {
  params: Promise<{
    tenantId: string;
  }>;
};

export default async function PublicSuccessPage({
  params,
}: PublicSuccessPageProps) {
  const { tenantId } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-slate-950">
          Solicitação enviada
        </h1>

        <p className="mt-3 text-slate-600">
          Seu caso foi enviado com sucesso. O escritório receberá as informações
          para análise inicial.
        </p>

        <Link
          href={`/advogado/${tenantId}`}
          className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Enviar outro caso
        </Link>
      </section>
    </main>
  );
}