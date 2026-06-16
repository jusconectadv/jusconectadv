import Link from "next/link";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createCaseAction } from "@/src/services/cases";

type NewCasePageProps = {
  searchParams?: Promise<{
    clientId?: string;
    error?: string;
  }>;
};

function getClientStatusLabel(active: boolean): string {
  return active ? "Ativo" : "Arquivado";
}

function getClientStatusClassName(active: boolean): string {
  if (active) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function getClientTypeClassName(type: string): string {
  if (type === "PJ") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

function getClientTypeLabel(type: string): string {
  if (type === "PJ") {
    return "Pessoa jurídica";
  }

  return "Pessoa física";
}

export default async function NewCasePage({ searchParams }: NewCasePageProps) {
  const query = searchParams ? await searchParams : {};
  const selectedClientId = query.clientId ?? "";

  const context = await requireUserContext();

  if ((context.role !== "lawyer" && context.role !== "master") || !context.tenant) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-900">
            Acesso indisponível
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-800">
            Esta área é exclusiva para o escritório.
          </p>
        </div>
      </section>
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name, email, document, type, active")
    .eq("tenant_id", context.tenant.id)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  const safeClients = clients ?? [];
  const activeClients = safeClients.filter((client) => client.active);
  const selectedClient = safeClients.find(
    (client) => client.id === selectedClientId,
  );

  const selectedClientIsArchived =
    selectedClient !== undefined && !selectedClient.active;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="flex flex-col justify-between gap-6 p-7 md:flex-row md:items-end md:p-8">
          <div>
            <Link
              href="/dashboard/cases"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para casos
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Atendimento jurídico
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Novo caso
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Crie um novo atendimento vinculado a um cliente ativo do
              escritório. Ao salvar, o sistema gera o caso e o link público de
              acompanhamento.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
            >
              Novo cliente
            </Link>

            <Link
              href="/dashboard/search"
              className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
            >
              Buscar dados
            </Link>
          </div>
        </div>
      </div>

      {query.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {query.error}
        </div>
      ) : null}

      {clientsError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Não foi possível carregar os clientes.
        </div>
      ) : null}

      {safeClients.length === 0 ? (
        <section className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
            Cadastro necessário
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#0B1D2D]">
            Nenhum cliente cadastrado
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7A5B24]">
            Para criar um caso, primeiro cadastre um cliente na base do
            escritório.
          </p>

          <Link
            href="/dashboard/clients/new"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
          >
            Cadastrar cliente
          </Link>
        </section>
      ) : activeClients.length === 0 ? (
        <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-700">
            Operação bloqueada
          </p>

          <h2 className="mt-2 text-xl font-bold text-red-900">
            Nenhum cliente ativo
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-red-800">
            Todos os clientes estão arquivados. Reative um cliente antes de
            criar um novo caso.
          </p>

          <Link
            href="/dashboard/clients?status=archived"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-red-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800"
          >
            Ver clientes arquivados
          </Link>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
              <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                  Vínculo
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                  Cliente selecionado
                </h2>
              </div>

              {selectedClient ? (
                <dl className="space-y-5 p-5 text-sm">
                  <div>
                    <dt className="font-semibold text-[#5B6472]">Nome</dt>
                    <dd className="mt-1 font-bold text-[#0B1D2D]">
                      {selectedClient.name}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-[#5B6472]">Tipo</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getClientTypeClassName(
                          selectedClient.type,
                        )}`}
                      >
                        {getClientTypeLabel(selectedClient.type)}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-[#5B6472]">Status</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getClientStatusClassName(
                          selectedClient.active,
                        )}`}
                      >
                        {getClientStatusLabel(selectedClient.active)}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-[#5B6472]">Documento</dt>
                    <dd className="mt-1 text-[#0B1D2D]">
                      {selectedClient.document ?? "Não informado"}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-[#5B6472]">E-mail</dt>
                    <dd className="mt-1 text-[#0B1D2D]">
                      {selectedClient.email ?? "Não informado"}
                    </dd>
                  </div>

                  <Link
                    href={`/dashboard/clients/${selectedClient.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                  >
                    Abrir cliente
                  </Link>
                </dl>
              ) : (
                <div className="p-5">
                  <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-4 text-sm leading-6 text-[#5B6472]">
                    Selecione um cliente ativo no formulário para vincular o
                    caso.
                  </div>
                </div>
              )}
            </div>

            {selectedClientIsArchived ? (
              <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-700">
                  Cliente arquivado
                </p>

                <h3 className="mt-2 text-base font-bold text-red-900">
                  Não é possível criar caso
                </h3>

                <p className="mt-2 text-sm leading-6 text-red-800">
                  Este cliente está arquivado e não pode receber novos casos.
                  Reative o cliente antes de continuar.
                </p>

                <Link
                  href={`/dashboard/clients/${selectedClient.id}`}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-red-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800"
                >
                  Abrir cliente para reativar
                </Link>
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
                  Dica
                </p>

                <h3 className="mt-2 text-base font-bold text-[#0B1D2D]">
                  Link de acompanhamento
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
                  Ao criar o caso, o sistema também gera um link público para o
                  cliente acompanhar mensagens e documentos.
                </p>
              </div>
            )}
          </aside>

          <form
            action={createCaseAction}
            className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
          >
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Dados do atendimento
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Informações do caso
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                Descreva o atendimento de forma clara para facilitar a análise.
              </p>
            </div>

            <div className="grid gap-5 p-5">
              <div>
                <label
                  htmlFor="clientId"
                  className="mb-2 block text-sm font-bold text-[#0B1D2D]"
                >
                  Cliente *
                </label>

                <select
                  id="clientId"
                  name="clientId"
                  required
                  defaultValue={
                    selectedClient && selectedClient.active
                      ? selectedClient.id
                      : ""
                  }
                  className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                >
                  <option value="">Selecione o cliente</option>

                  {activeClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-bold text-[#0B1D2D]"
                >
                  Título *
                </label>

                <input
                  id="title"
                  name="title"
                  required
                  placeholder="Ex: Revisão contratual, problema trabalhista..."
                  className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-bold text-[#0B1D2D]"
                >
                  Prioridade
                </label>

                <select
                  id="priority"
                  name="priority"
                  defaultValue="medium"
                  className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-bold text-[#0B1D2D]"
                >
                  Descrição *
                </label>

                <textarea
                  id="description"
                  name="description"
                  required
                  rows={10}
                  placeholder="Descreva o caso com detalhes."
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#ECE7DD] bg-[#F8F6F1] p-5 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard/cases"
                className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-5 py-3 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Criar caso
              </button>
            </div>
          </form>
        </section>
      )}
    </section>
  );
}