"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardRole = "master" | "lawyer" | "client";

type NavigationItem = {
  href: string;
  label: string;
  description?: string;
  roles: readonly DashboardRole[];
  exact?: boolean;
};

type NavigationGroup = {
  title: string;
  items: readonly NavigationItem[];
};

const navigationGroups: readonly NavigationGroup[] = [
  {
    title: "Principal",
    items: [
      {
        href: "/dashboard",
        label: "Visão geral",
        description: "Resumo do escritório",
        roles: ["master", "lawyer"],
        exact: true,
      },
      {
        href: "/dashboard/client",
        label: "Área do cliente",
        description: "Seu espaço principal",
        roles: ["client"],
        exact: true,
      },
      {
        href: "/dashboard/notifications",
        label: "Notificações",
        description: "Pendências recentes",
        roles: ["lawyer"],
      },
    ],
  },
  {
    title: "Atendimento",
    items: [
      {
        href: "/dashboard/clients",
        label: "Clientes",
        description: "PF, PJ e contatos",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/cases",
        label: "Casos",
        description: "Atendimentos jurídicos",
        roles: ["lawyer"],
        exact: true,
      },
      {
        href: "/dashboard/cases/kanban",
        label: "Kanban",
        description: "Fluxo operacional",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/meetings",
        label: "Agenda",
        description: "Reuniões e solicitações",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/tasks",
        label: "Tarefas",
        description: "Prazos e atividades",
        roles: ["lawyer"],
      },

      // PORTAL DO CLIENTE
      {
        href: "/dashboard/client/services",
        label: "Serviços",
        description: "Como podemos ajudar?",
        roles: ["client"],
        exact: true,
      },
      {
        href: "/dashboard/client/cases",
        label: "Acompanhe",
        description: "Seus atendimentos",
        roles: ["client"],
      },
      {
        href: "/dashboard/client/meetings",
        label: "Minhas reuniões",
        description: "Agenda com o escritório",
        roles: ["client"],
      },
    ],
  },
  {
    title: "Ferramentas",
    items: [
      {
        href: "/dashboard/search",
        label: "Busca global",
        description: "Dados internos",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/templates",
        label: "Templates",
        description: "Modelos jurídicos",
        roles: ["lawyer"],
      },
    ],
  },
  {
    title: "Administração",
    items: [
      {
        href: "/dashboard/team",
        label: "Equipe",
        description: "Colaboradores",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/settings",
        label: "Configurações",
        description: "Escritório e página pública",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/master",
        label: "Master",
        description: "Gestão global",
        roles: ["master"],
      },
    ],
  },
];

type DashboardSidebarProps = {
  role: DashboardRole;
  pendingMeetingCount?: number;
};

function getAllowedItems(
  items: readonly NavigationItem[],
  role: DashboardRole,
): NavigationItem[] {
  return items.filter((item) => item.roles.includes(role));
}

function isActiveRoute(
  pathname: string,
  item: NavigationItem,
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}

function formatBadgeCount(count: number): string {
  if (count > 99) {
    return "99+";
  }

  return String(count);
}

export function DashboardSidebar({
  role,
  pendingMeetingCount = 0,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const allowedGroups = navigationGroups
    .map((group) => ({
      title: group.title,
      items: getAllowedItems(group.items, role),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="hidden min-h-screen w-80 border-r border-[#1E2A3A] bg-[#0B1D2D] p-6 text-white lg:block">
      <div className="mb-9">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C89B4A]/40 bg-[#0F273B] shadow-lg shadow-black/20">
            <span className="text-lg font-bold text-[#C89B4A]">
              J
            </span>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              SaaS Jurídico
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-wide text-white">
              JUSCONECT{" "}
              <span className="text-[#C89B4A]">ADV</span>
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-56 text-xs leading-5 text-[#B8C2CC]">
          Tecnologia que conecta, direito que resolve.
        </p>
      </div>

      <nav className="space-y-7">
        {allowedGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#C89B4A]/80">
              {group.title}
            </p>

            <div className="space-y-2">
              {group.items.map((item) => {
                const active = isActiveRoute(pathname, item);

                const showMeetingBadge =
                  item.href === "/dashboard/meetings" &&
                  pendingMeetingCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "block rounded-2xl border border-[#C89B4A]/40 bg-[#F2EFEA] px-4 py-3 text-[#0B1D2D] shadow-lg shadow-black/20"
                        : "block rounded-2xl border border-transparent px-4 py-3 text-[#D8DEE5] transition hover:border-[#C89B4A]/30 hover:bg-[#132D44] hover:text-white"
                    }
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>

                      {showMeetingBadge ? (
                        <span
                          className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-black leading-none text-white shadow-md shadow-red-950/30"
                          aria-label={`${pendingMeetingCount} solicitações de reunião pendentes`}
                          title={`${pendingMeetingCount} solicitações de reunião pendentes`}
                        >
                          {formatBadgeCount(
                            pendingMeetingCount,
                          )}
                        </span>
                      ) : null}
                    </span>

                    {item.description ? (
                      <span
                        className={
                          active
                            ? "mt-0.5 block text-xs text-[#5B6472]"
                            : "mt-0.5 block text-xs text-[#8FA0AE]"
                        }
                      >
                        {item.description}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {role === "lawyer" ? (
        <div className="mt-9 rounded-3xl border border-[#C89B4A]/30 bg-[#132D44] p-5 shadow-lg shadow-black/20">
          <p className="text-sm font-semibold text-white">
            Página pública do escritório
          </p>

          <p className="mt-2 text-xs leading-5 text-[#B8C2CC]">
            Configure sua vitrine digital e compartilhe o link com
            novos clientes.
          </p>

          <Link
            href="/dashboard/settings"
            className="mt-4 inline-flex rounded-xl bg-[#C89B4A] px-4 py-2 text-xs font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
          >
            Configurar página
          </Link>
        </div>
      ) : null}

      {role === "client" ? (
        <div className="mt-9 rounded-3xl border border-[#C89B4A]/30 bg-[#132D44] p-5 shadow-lg shadow-black/20">
          <p className="text-sm font-semibold text-white">
            Precisa falar com o escritório?
          </p>

          <p className="mt-2 text-xs leading-5 text-[#B8C2CC]">
            Abra um atendimento ou solicite uma reunião com a
            equipe.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard/client/services"
              className="inline-flex rounded-xl bg-[#C89B4A] px-4 py-2 text-xs font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Ver serviços
            </Link>

            <Link
              href="/dashboard/client/meetings"
              className="inline-flex rounded-xl border border-[#C89B4A]/40 bg-[#0B1D2D] px-4 py-2 text-xs font-bold text-white transition hover:border-[#C89B4A]"
            >
              Reuniões
            </Link>
          </div>
        </div>
      ) : null}
    </aside>
  );
}