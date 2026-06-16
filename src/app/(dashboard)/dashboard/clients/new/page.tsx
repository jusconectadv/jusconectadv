import Link from "next/link";

import { MaskedInput } from "@/src/components/forms/MaskedInput";
import { createClientAction } from "@/src/services/clients";

type NewClientPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function NewClientPage({
  searchParams,
}: NewClientPageProps) {
  const query = searchParams ? await searchParams : {};

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="flex flex-col justify-between gap-6 p-7 md:flex-row md:items-end md:p-8">
          <div>
            <Link
              href="/dashboard/clients"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para clientes
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Base do escritório
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Novo cliente
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Cadastre uma pessoa física ou jurídica na base do escritório.
              Depois, você poderá abrir casos vinculados a este cadastro.
            </p>
          </div>

          <Link
            href="/dashboard/search"
            className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
          >
            Buscar dados
          </Link>
        </div>
      </div>

      {query.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {query.error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Orientações
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Cadastro manual
              </h2>
            </div>

            <div className="space-y-4 p-5 text-sm leading-6 text-[#5B6472]">
              <p>
                Este cadastro cria apenas o registro do cliente dentro do
                escritório.
              </p>

              <p>
                Caso o cliente crie uma conta depois usando o mesmo e-mail, o
                sistema consegue vincular o login dele ao cadastro existente.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Importante
            </p>

            <h3 className="mt-2 text-base font-bold text-[#0B1D2D]">
              Vínculo seguro
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
              O cliente criado manualmente não usa o login do advogado. Isso
              evita conflito de vínculo dentro do banco e mantém a relação com o
              cliente organizada.
            </p>
          </div>
        </aside>

        <form
          action={createClientAction}
          className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
        >
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Dados cadastrais
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Informações do cliente
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Preencha os dados principais para identificação e contato.
            </p>
          </div>

          <div className="grid gap-5 p-5">
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
                defaultValue="PF"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              >
                <option value="PF">Pessoa física</option>
                <option value="PJ">Pessoa jurídica</option>
              </select>
            </div>

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
                placeholder="Nome completo ou razão social"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div>
              <label
                htmlFor="document"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                CPF/CNPJ
              </label>

              <MaskedInput
                id="document"
                name="document"
                mask="cpfCnpj"
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

                <MaskedInput
                  id="phone"
                  name="phone"
                  mask="phone"
                  placeholder="(21) 99999-9999"
                  className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#ECE7DD] bg-[#F8F6F1] p-5 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-5 py-3 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Salvar cliente
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}