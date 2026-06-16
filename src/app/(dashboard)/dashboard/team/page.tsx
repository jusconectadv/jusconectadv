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

  return "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
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
  const activeMembers = team.members.filter(
    (member) => member.membership.is_active,
  );
  const inactiveMembers = team.members.filter(
    (member) => !member.membership.is_active,
  );
  const staffMembers = team.members.filter(
    (member) => member.membership.role === "staff",
  );
  const ownerMembers = team.members.filter(
    (member) => member.membership.role === "owner",
  );

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Sistema do escritório
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Equipe
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Gerencie os membros internos do escritório. Colaboradores podem
              acessar o painel do advogado e atuar nos dados da operação
              conforme as permissões atuais.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Configurações
              </Link>

              <Link
                href="/dashboard/audit"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Auditoria
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Visão geral
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Resumo da equipe
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Total</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {team.members.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Ativos</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {activeMembers.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Staff</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {staffMembers.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Inativos</p>
                  <p className="mt-1 text-2xl font-bold text-red-300">
                    {inactiveMembers.length}
                  </p>
                </div>
              </div>
            </div>
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

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">Total</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {team.members.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Membros vinculados
          </p>
        </div>

        <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-purple-700">
            Proprietários
          </p>

          <strong className="mt-2 block text-3xl font-bold text-purple-700">
            {ownerMembers.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Donos do escritório
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Equipe</p>

          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {staffMembers.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Colaboradores internos
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">Ativos</p>

          <strong className="mt-2 block text-3xl font-bold text-emerald-700">
            {activeMembers.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Com acesso liberado
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          action={createStaffMemberAction}
          className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
        >
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Novo colaborador
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Adicionar colaborador
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#5B6472]">
              Crie um acesso interno para outro usuário do escritório.
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                Nome completo *
              </label>

              <input
                name="fullName"
                required
                placeholder="Ex: Maria Silva"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                E-mail *
              </label>

              <input
                name="email"
                type="email"
                required
                placeholder="maria@email.com"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                Senha provisória
              </label>

              <input
                name="temporaryPassword"
                type="text"
                placeholder="Mínimo 6 caracteres para novo usuário"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />

              <p className="mt-2 text-xs leading-5 text-[#5B6472]">
                Se o e-mail já existir no sistema, a senha não será usada. Se
                for um novo usuário, informe uma senha provisória.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                Função
              </label>

              <select
                name="role"
                defaultValue="staff"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              >
                <option value="staff">Equipe</option>
              </select>
            </div>

            <div className="rounded-2xl border border-[#E7D7B5] bg-[#FFF8E8] p-4">
              <h3 className="text-sm font-bold text-[#0B1D2D]">
                Permissão do colaborador
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
                O membro staff poderá acessar o painel do advogado e atuar nos
                dados do escritório conforme as regras internas atuais.
              </p>
            </div>
          </div>

          <div className="border-t border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <button
              type="submit"
              className="w-full rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Criar colaborador
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Membros
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                Membros do escritório
              </h2>

              <p className="mt-1 text-sm text-[#5B6472]">
                {team.members.length} membro(s) interno(s) encontrado(s).
              </p>
            </div>
          </div>

          {team.members.length === 0 ? (
            <div className="p-8">
              <div className="rounded-3xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-8 text-center">
                <p className="text-sm font-bold text-[#0B1D2D]">
                  Nenhum membro encontrado.
                </p>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5B6472]">
                  Quando houver colaboradores vinculados, eles aparecerão aqui.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#ECE7DD]">
              {team.members.map((member) => (
                <article
                  key={member.membership.id}
                  className="p-5 transition hover:bg-[#F8F6F1]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getRoleClassName(
                            member.membership.role,
                          )}`}
                        >
                          {getRoleLabel(member.membership.role)}
                        </span>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClassName(
                            member.membership.is_active,
                          )}`}
                        >
                          {getStatusLabel(member.membership.is_active)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-[#0B1D2D]">
                        {member.profile?.full_name ?? "Nome não informado"}
                      </h3>

                      <p className="mt-1 text-sm text-[#5B6472]">
                        {member.profile?.email ?? "E-mail não informado"}
                      </p>

                      <p className="mt-3 text-xs text-[#8FA0AE]">
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
                              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
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
                              className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
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
  );
}