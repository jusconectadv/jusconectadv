import Link from "next/link";

type DashboardRole = "master" | "lawyer" | "client";

type NavigationItem = {
  href: string;
  label: string;
  roles: readonly DashboardRole[];
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
        roles: ["master", "lawyer", "client"],
      },
      {
        href: "/dashboard/cases",
        label: "Casos",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/cases/kanban",
        label: "Kanban",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/tasks",
        label: "Tarefas",
        roles: ["lawyer"],
      },
    ],
  },
  {
    title: "Relacionamento",
    items: [
      {
        href: "/dashboard/clients",
        label: "Clientes",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/search",
        label: "Busca global",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/activity",
        label: "Atividades",
        roles: ["lawyer"],
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        href: "/dashboard/templates",
        label: "Templates",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/team",
        label: "Equipe",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/settings",
        label: "Configurações",
        roles: ["lawyer"],
      },
      {
        href: "/dashboard/master",
        label: "Master",
        roles: ["master"],
      },
      {
        href: "/dashboard/client",
        label: "Área do cliente",
        roles: ["client"],
      },
    ],
  },
];

type DashboardSidebarProps = {
  role: DashboardRole;
};

function getAllowedItems(
  items: readonly NavigationItem[],
  role: DashboardRole,
): NavigationItem[] {
  return items.filter((item) => item.roles.includes(role));
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const allowedGroups = navigationGroups
    .map((group) => ({
      title: group.title,
      items: getAllowedItems(group.items, role),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white p-6 lg:block">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          SaaS Jurídico
        </p>

        <h1 className="mt-2 text-xl font-bold text-slate-950">
          JUSCONECT ADV
        </h1>
      </div>

      <nav className="space-y-8">
        {allowedGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {group.title}
            </p>

            <div className="space-y-2">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}