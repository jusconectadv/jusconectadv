import Link from "next/link";

import {
  createStaffMemberAction,
  deactivateStaffMemberAction,
  listLawyerTeamMembers,
  reactivateStaffMemberAction,
} from "@/src/services/lawyer-team";

type TeamPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function getRoleLabel(role: string): string {
  if (role === "owner") {
    return "Proprietário";
  }

  if (role === "staff") {
    return "Equipe";
  }

  return role;
}

function getRoleClassName(role: string): string {
  if (role === "owner") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (role === "staff") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function getStatusLabel(isActive: boolean): string {
  return isActive ? "Ativo" : "Inativo";
}

function getStatusClassName(isActive: boolean): string {
  if (isActive) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function getSuccessMessage(success: string | undefined): string | null {
  if (success === "staff-created") {
    return "Membro de equipe criado com sucesso.";
  }

  if (success === "staff-deactivated") {
    return "Membro de equipe desativado com sucesso.";
  }

  if (success === "staff-reactivated") {
    return "Membro de equipe reativado com sucesso.";
  }

  return null;
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const team = await listLawyerTeamMembers();

  const successMessage = getSuccessMessage(resolvedSearchParams.success);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Sistema do escritório
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Equipe
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Gerencie os membros internos do escritório. Membros da equipe
              acessam o painel do advogado como colaboradores.
            </p>
          </div>

          <Link
            href="/dashboard/settings"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Configurações
          </Link>
        </header>

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {resolvedSearchParams.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form
            action={createStaffMemberAction}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Adicionar colaborador
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Crie um acesso interno para outro usuário do escritório.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nome completo *
                </label>

                <input
                  name="fullName"
                  required
                  placeholder="Ex: Maria Silva"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  E-mail *
                </label>

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="maria@email.com"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Senha provisória
                </label>

                <input
                  name="temporaryPassword"
                  type="text"
                  placeholder="Mínimo 6 caracteres para novo usuário"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                />

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Se o e-mail já existir no sistema, a senha não será usada. Se
                  for um novo usuário, informe uma senha provisória.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Função
                </label>

                <select
                  name="role"
                  defaultValue="staff"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="staff">Equipe</option>
                </select>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h3 className="text-sm font-semibold text-blue-900">
                  Permissão do colaborador
                </h3>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  O membro staff poderá acessar o painel do advogado e atuar nos
                  dados do escritório conforme as regras internas atuais.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Criar colaborador
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Membros do escritório
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {team.members.length} membro(s) interno(s) encontrado(s).
                </p>
              </div>
            </div>

            {team.members.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Nenhum membro encontrado.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Quando houver colaboradores vinculados, eles aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {team.members.map((member) => (
                  <article key={member.membership.id} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getRoleClassName(
                              member.membership.role,
                            )}`}
                          >
                            {getRoleLabel(member.membership.role)}
                          </span>

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                              member.membership.is_active,
                            )}`}
                          >
                            {getStatusLabel(member.membership.is_active)}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-semibold text-slate-950">
                          {member.profile?.full_name ?? "Nome não informado"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {member.profile?.email ?? "E-mail não informado"}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                          Vinculado em {formatDate(member.membership.created_at)}
                        </p>
                      </div>

                      {member.membership.role === "staff" ? (
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          {member.membership.is_active ? (
                            <form action={deactivateStaffMemberAction}>
                              <input
                                type="hidden"
                                name="membershipId"
                                value={member.membership.id}
                              />

                              <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                              >
                                Desativar
                              </button>
                            </form>
                          ) : (
                            <form action={reactivateStaffMemberAction}>
                              <input
                                type="hidden"
                                name="membershipId"
                                value={member.membership.id}
                              />

                              <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                              >
                                Reativar
                              </button>
                            </form>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}