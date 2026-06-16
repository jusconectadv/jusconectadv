import Link from "next/link";

import { logoutAction } from "@/src/app/(auth)/actions";
import type { UserContext } from "@/src/types/auth";

type DashboardHeaderProps = {
  context: UserContext;
};

function getRoleLabel(role: string): string {
  if (role === "lawyer") {
    return "Advogado";
  }

  if (role === "client") {
    return "Cliente";
  }

  if (role === "master") {
    return "Master";
  }

  return role;
}

export function DashboardHeader({ context }: DashboardHeaderProps) {
  const isLawyer = context.role === "lawyer";
  const isClient = context.role === "client";

  return (
    <header className="sticky top-0 z-30 border-b border-[#D8D2C7] bg-[#F8F6F1]/95 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
            {context.tenant?.name ?? "JUSCONECT ADV"}
          </p>

          <h2 className="mt-1 text-base font-semibold text-[#0B1D2D]">
            {context.profile.full_name ?? context.user.email}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {isLawyer ? (
            <div className="hidden items-center gap-2 xl:flex">
              <Link
                href="/dashboard/clients/new"
                className="rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] shadow-sm transition hover:border-[#C89B4A] hover:text-[#9E762D]"
              >
                Novo cliente
              </Link>

              <Link
                href="/dashboard/cases/new"
                className="rounded-xl bg-[#0B1D2D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#132D44]"
              >
                Novo caso
              </Link>
            </div>
          ) : null}

          {isClient ? (
            <Link
              href="/dashboard/client/cases/new"
              className="hidden rounded-xl bg-[#0B1D2D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#132D44] md:inline-flex"
            >
              Novo atendimento
            </Link>
          ) : null}

          <span className="rounded-full border border-[#D8D2C7] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0B1D2D] shadow-sm">
            {getRoleLabel(context.role)}
          </span>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] shadow-sm transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}