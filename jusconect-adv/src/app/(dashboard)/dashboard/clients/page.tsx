import Link from "next/link";

import { listClients } from "@/src/services/clients";

function getClientTypeLabel(type: string | null): string {
  if (type === "PF") {
    return "PF";
  }

  if (type === "PJ") {
    return "PJ";
  }

  return "-";
}

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Base do escritório
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Clientes
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gerencie os clientes vinculados ao escritório e acesse o histórico
            completo de atendimentos.
          </p>
        </div>

        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Novo cliente
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Clientes cadastrados
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {clients.length} cliente(s) encontrado(s).
            </p>
          </div>

          <Link
            href="/dashboard/search"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Buscar cliente
          </Link>
        </div>

        {clients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              Nenhum cliente cadastrado ainda.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Clientes criados pelo link público ou manualmente aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Documento</th>
                  <th className="px-5 py-3 font-medium">E-mail</th>
                  <th className="px-5 py-3 font-medium">Telefone</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="font-semibold text-slate-950 hover:text-slate-700"
                        >
                          {client.name}
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          ID: {client.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {getClientTypeLabel(client.type)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {client.document ?? "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {client.email ?? "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {client.phone ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Abrir cliente
                        </Link>

                        <Link
                          href="/dashboard/cases/new"
                          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                        >
                          Novo caso
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}