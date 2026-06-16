import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUserContext } from "@/src/lib/auth/get-user-context";

export default async function LawyerDashboardPage() {
  const context = await requireUserContext();

  if (context.role !== "lawyer") {
    redirect("/dashboard");
  }

  const publicLink = context.tenant
    ? `/advogado/${context.tenant.id}`
    : "/dashboard";

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-950">Painel Advogado</h1>

      <p className="mt-2 text-slate-600">
        Escritório: {context.tenant?.name ?? "Tenant não encontrado"}
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-950">
          Link público de atendimento
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Envie este link para clientes abrirem solicitações diretamente no seu
          escritório.
        </p>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
          {publicLink}
        </div>

        <Link
          href={publicLink}
          target="_blank"
          className="mt-4 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Abrir link público
        </Link>
      </div>
    </section>
  );
}