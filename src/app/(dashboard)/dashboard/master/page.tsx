import { redirect } from "next/navigation";
import { requireUserContext } from "@/src/lib/auth/get-user-context";

export default async function MasterDashboardPage() {
  const context = await requireUserContext();

  if (context.role !== "master") {
    redirect("/dashboard");
  }

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-950">Painel Master</h1>
      <p className="mt-2 text-slate-600">
        Área global de administração do JUSCONECT ADV.
      </p>
    </section>
  );
}