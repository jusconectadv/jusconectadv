type DashboardStatsProps = {
  totalCases: number;
  urgentCases: number;
  waitingClientCases: number;
  resolvedCases: number;
};

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  color: string;
};

function StatCard({
  title,
  value,
  description,
  color,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`mb-4 h-2 w-16 rounded-full ${color}`}
      />

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold text-slate-950">
        {value}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

export function DashboardStats({
  totalCases,
  urgentCases,
  waitingClientCases,
  resolvedCases,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Casos ativos"
        value={totalCases}
        description="Total de casos cadastrados."
        color="bg-blue-500"
      />

      <StatCard
        title="Urgentes"
        value={urgentCases}
        description="Demandas prioritárias."
        color="bg-red-500"
      />

      <StatCard
        title="Aguardando cliente"
        value={waitingClientCases}
        description="Pendentes de retorno."
        color="bg-orange-500"
      />

      <StatCard
        title="Finalizados"
        value={resolvedCases}
        description="Casos concluídos."
        color="bg-emerald-500"
      />
    </div>
  );
}