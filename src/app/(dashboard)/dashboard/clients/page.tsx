import Link from "next/link";

import {
  archiveClientAction,
  restoreClientAction,
} from "@/src/services/client-status";
import { listClients } from "@/src/services/clients";

type ClientsPageProps = {
  searchParams?: Promise<{
    q?: string;
    type?: string;
    status?: string;
    success?: string;
    error?: string;
  }>;
};

type ClientTypeFilter = "all" | "PF" | "PJ";
type ClientStatusFilter = "active" | "archived" | "all";

function getClientTypeLabel(type: string | null): string {
  if (type === "PF") return "PF";
  if (type === "PJ") return "PJ";
  return "-";
}

function getClientTypeFullLabel(type: string | null): string {
  if (type === "PF") return "Pessoa física";
  if (type === "PJ") return "Pessoa jurídica";
  return "Não informado";
}

function getClientTypeClassName(type: string | null): string {
  if (type === "PF") return "border-blue-200 bg-blue-50 text-blue-700";
  if (type === "PJ") return "border-purple-200 bg-purple-50 text-purple-700";
  return "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
}

function getClientStatusClassName(active: boolean): string {
  if (active) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function normalizeSearch(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function getValidTypeFilter(type: string | undefined): ClientTypeFilter {
  if (type === "PF") return "PF";
  if (type === "PJ") return "PJ";
  return "all";
}

function getValidStatusFilter(status: string | undefined): ClientStatusFilter {
  if (status === "archived") return "archived";
  if (status === "all") return "all";
  return "active";
}

function getSuccessMessage(success: string | undefined): string | null {
  if (success === "client-archived") {
    return "Cliente arquivado com sucesso.";
  }

  if (success === "client-restored") {
    return "Cliente reativado com sucesso.";
  }

  if (success === "client-created") {
    return "Cliente criado com sucesso.";
  }

  if (success === "client-updated") {
    return "Cliente atualizado com sucesso.";
  }

  return null;
}

function clientMatchesSearch(
  client: {
    name: string;
    email: string | null;
    phone: string | null;
    document: string | null;
    type: string;
  },
  search: string,
): boolean {
  if (!search) return true;

  return (
    client.name.toLowerCase().includes(search) ||
    (client.email ?? "").toLowerCase().includes(search) ||
    (client.phone ?? "").toLowerCase().includes(search) ||
    (client.document ?? "").toLowerCase().includes(search) ||
    getClientTypeFullLabel(client.type).toLowerCase().includes(search)
  );
}

function clientMatchesType(
  client: { type: string },
  type: ClientTypeFilter,
): boolean {
  if (type === "all") return true;

  return client.type === type;
}

function clientMatchesStatus(
  client: { active: boolean },
  status: ClientStatusFilter,
): boolean {
  if (status === "all") return true;
  if (status === "archived") return !client.active;

  return client.active;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const clients = await listClients();

  const search = normalizeSearch(resolvedSearchParams.q);
  const selectedType = getValidTypeFilter(resolvedSearchParams.type);
  const selectedStatus = getValidStatusFilter(resolvedSearchParams.status);
  const successMessage = getSuccessMessage(resolvedSearchParams.success);

  const filteredClients = clients.filter(
    (client) =>
      clientMatchesSearch(client, search) &&
      clientMatchesType(client, selectedType) &&
      clientMatchesStatus(client, selectedStatus),
  );

  const activeClients = clients.filter((client) => client.active);
  const archivedClients = clients.filter((client) => !client.active);
  const pfClients = clients.filter((client) => client.type === "PF");
  const pjClients = clients.filter((client) => client.type === "PJ");

  const hasFilters =
    search.length > 0 || selectedType !== "all" || selectedStatus !== "active";

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="flex flex-col justify-between gap-6 p-7 md:flex-row md:items-end md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Relacionamento
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Clientes
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Gerencie pessoas físicas e jurídicas, acompanhe clientes ativos,
              arquivados e inicie novos casos diretamente pela base do
              escritório.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/search"
              className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
            >
              Buscar dados
            </Link>

            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Novo cliente
            </Link>
          </div>
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">Total</p>
          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {clients.length}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Base completa</p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">Ativos</p>
          <strong className="mt-2 block text-3xl font-bold text-emerald-700">
            {activeClients.length}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Em relacionamento</p>
        </div>

        <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-700">Arquivados</p>
          <strong className="mt-2 block text-3xl font-bold text-red-700">
            {archivedClients.length}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Fora da operação</p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">PF</p>
          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {pfClients.length}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Pessoas físicas</p>
        </div>

        <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-purple-700">PJ</p>
          <strong className="mt-2 block text-3xl font-bold text-purple-700">
            {pjClients.length}
          </strong>
          <p className="mt-2 text-xs text-[#5B6472]">Pessoas jurídicas</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Pesquisa
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Buscar e filtrar
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Por padrão, exibimos apenas clientes ativos.
            </p>
          </div>

          {hasFilters ? (
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Limpar filtros
            </Link>
          ) : null}
        </div>

        <form className="grid gap-3 p-5 lg:grid-cols-[1.3fr_0.7fr_0.7fr_auto]">
          <div>
            <label
              htmlFor="q"
              className="mb-1 block text-sm font-semibold text-[#0B1D2D]"
            >
              Busca
            </label>

            <input
              id="q"
              name="q"
              type="search"
              defaultValue={resolvedSearchParams.q ?? ""}
              placeholder="Nome, e-mail, documento ou telefone..."
              className="min-h-11 w-full rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-1 block text-sm font-semibold text-[#0B1D2D]"
            >
              Tipo
            </label>

            <select
              id="type"
              name="type"
              defaultValue={selectedType}
              className="min-h-11 w-full rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            >
              <option value="all">Todos</option>
              <option value="PF">Pessoa física</option>
              <option value="PJ">Pessoa jurídica</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-semibold text-[#0B1D2D]"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={selectedStatus}
              className="min-h-11 w-full rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            >
              <option value="active">Ativos</option>
              <option value="archived">Arquivados</option>
              <option value="all">Todos</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#0B1D2D] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#132D44]"
            >
              Aplicar
            </button>
          </div>
        </form>
      </section>

      <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Base de relacionamento
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Clientes cadastrados
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              {filteredClients.length} de {clients.length} cliente(s)
              exibido(s).
            </p>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-bold text-[#0B1D2D]">
              Nenhum cliente encontrado.
            </p>

            <p className="mt-1 text-sm text-[#5B6472]">
              Ajuste os filtros ou cadastre um novo cliente.
            </p>

            <Link
              href="/dashboard/clients/new"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Novo cliente
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left text-sm">
              <thead className="border-b border-[#ECE7DD] bg-[#0B1D2D] text-white">
                <tr>
                  <th className="px-5 py-4 font-semibold">Nome</th>
                  <th className="px-5 py-4 font-semibold">Tipo</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Documento</th>
                  <th className="px-5 py-4 font-semibold">E-mail</th>
                  <th className="px-5 py-4 font-semibold">Telefone</th>
                  <th className="px-5 py-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-[#ECE7DD] transition last:border-b-0 hover:bg-[#F8F6F1]"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="font-bold text-[#0B1D2D] hover:text-[#9E762D]"
                      >
                        {client.name}
                      </Link>

                      <p className="mt-1 text-xs text-[#8FA0AE]">
                        ID: {client.id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getClientTypeClassName(
                          client.type,
                        )}`}
                      >
                        {getClientTypeLabel(client.type)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getClientStatusClassName(
                          client.active,
                        )}`}
                      >
                        {client.active ? "Ativo" : "Arquivado"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-[#5B6472]">
                      {client.document ?? "-"}
                    </td>

                    <td className="px-5 py-4 text-[#5B6472]">
                      {client.email ?? "-"}
                    </td>

                    <td className="px-5 py-4 text-[#5B6472]">
                      {client.phone ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-xs font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                        >
                          Abrir
                        </Link>

                        <Link
                          href={`/dashboard/clients/${client.id}/edit`}
                          className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-xs font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                        >
                          Editar
                        </Link>

                        {client.active ? (
                          <>
                            <Link
                              href={`/dashboard/cases/new?clientId=${client.id}`}
                              className="inline-flex items-center justify-center rounded-xl bg-[#0B1D2D] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#132D44]"
                            >
                              Novo caso
                            </Link>

                            <form action={archiveClientAction}>
                              <input
                                type="hidden"
                                name="clientId"
                                value={client.id}
                              />

                              <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                              >
                                Arquivar
                              </button>
                            </form>
                          </>
                        ) : (
                          <form action={restoreClientAction}>
                            <input
                              type="hidden"
                              name="clientId"
                              value={client.id}
                            />

                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              Reativar
                            </button>
                          </form>
                        )}
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