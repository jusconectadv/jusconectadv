import { logoutAction } from "@/src/app/(auth)/actions";
import type { UserContext } from "@/src/types/auth";

type DashboardHeaderProps = {
  context: UserContext;
};

export function DashboardHeader({ context }: DashboardHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {context.tenant?.name ?? "JUSCONECT ADV"}
          </p>
          <h2 className="font-semibold text-slate-950">
            {context.profile.full_name ?? context.user.email}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase text-slate-700">
            {context.role}
          </span>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}