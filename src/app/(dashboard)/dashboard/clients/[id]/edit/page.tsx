import Link from "next/link";

import {
  getEditableClient,
  updateClientDetailsAction,
} from "@/src/services/client-edit";

type EditClientPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getClientTypeLabel(type: string): string {
  if (type === "PJ") {
    return "Pessoa jurídica";
  }

  if (type === "PF") {
    return "Pessoa física";
  }

  return "Não informado";
}

function getClientStatusLabel(active: boolean): string {
  return active ? "Ativo" : "Arquivado";
}

function getClientStatusClassName(active: boolean): string {
  if (active) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

export default async function EditClientPage({
  params,
  searchParams,
}: EditClientPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const { client } = await getEditableClient(resolvedParams.id);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="flex flex-col justify-between gap-6 p-7 md:flex-row md:items-end md:p-8">
          <div>
            <Link
              href={`/dashboard/clients/${client.id}`}
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para o cliente
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Base do escritório
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Editar cliente
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Atualize os dados cadastrais do cliente. Os casos já vinculados
              continuam associados a este mesmo registro.
            </p>
          </div>

          <Link
            href={`/dashboard/clients/${client.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
          >
            Abrir cliente
          </Link>
        </div>
      </div>

      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Dados atuais
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Cliente cadastrado
              </h2>
            </div>

            <dl className="space-y-5 p-5 text-sm">
              <div>
                <dt className="font-semibold text-[#5B6472]">Status</dt>

                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getClientStatusClassName(
                      client.active,
                    )}`}
                  >
                    {getClientStatusLabel(client.active)}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">Nome</dt>
                <dd className="mt-1 font-bold text-[#0B1D2D]">
                  {client.name}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">Tipo</dt>
                <dd className="mt-1 text-[#0B1D2D]">
                  {getClientTypeLabel(client.type)}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">Documento</dt>
                <dd className="mt-1 text-[#0B1D2D]">
                  {client.document ?? "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">E-mail</dt>
                <dd className="mt-1 text-[#0B1D2D]">
                  {client.email ?? "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-[#5B6472]">Telefone</dt>
                <dd className="mt-1 text-[#0B1D2D]">
                  {client.phone ?? "Não informado"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Observação
            </p>

            <h3 className="mt-2 text-base font-bold text-[#0B1D2D]">
              Login do cliente
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
              Alterar o e-mail aqui não altera automaticamente o login do
              cliente, caso ele já tenha uma conta autenticada.
            </p>
          </div>
        </aside>

        <form
          action={updateClientDetailsAction}
          className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
        >
          <input type="hidden" name="clientId" value={client.id} />

          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Atualização cadastral
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Dados editáveis
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Revise as informações antes de salvar as alterações.
            </p>
          </div>

          <div className="grid gap-5 p-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Nome *
              </label>

              <input
                id="name"
                name="name"
                required
                defaultValue={client.name}
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Tipo
              </label>

              <select
                id="type"
                name="type"
                defaultValue={client.type}
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              >
                <option value="PF">Pessoa física</option>
                <option value="PJ">Pessoa jurídica</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="document"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Documento
              </label>

              <input
                id="document"
                name="document"
                defaultValue={client.document ?? ""}
                placeholder="CPF ou CNPJ"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
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
                  defaultValue={client.email ?? ""}
                  placeholder="cliente@email.com"
                  className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-[#0B1D2D]"
                >
                  Telefone
                </label>

                <input
                  id="phone"
                  name="phone"
                  defaultValue={client.phone ?? ""}
                  placeholder="(21) 99999-9999"
                  className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#ECE7DD] bg-[#F8F6F1] p-5 sm:flex-row sm:justify-end">
            <Link
              href={`/dashboard/clients/${client.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-5 py-3 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}