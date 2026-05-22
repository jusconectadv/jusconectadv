type CaseStatus =
  | "new"
  | "analyzing"
  | "triage"
  | "in_progress"
  | "waiting_client"
  | "resolved"
  | "closed";

type Props = {
  status: string;
};

const statusMap: Record<
  CaseStatus,
  {
    label: string;
    className: string;
  }
> = {
  new: {
    label: "Novo",
    className: "bg-blue-100 text-blue-700",
  },

  analyzing: {
    label: "Em análise",
    className: "bg-purple-100 text-purple-700",
  },

  triage: {
    label: "Triagem IA",
    className: "bg-indigo-100 text-indigo-700",
  },

  in_progress: {
    label: "Em andamento",
    className: "bg-cyan-100 text-cyan-700",
  },

  waiting_client: {
    label: "Aguardando cliente",
    className: "bg-yellow-100 text-yellow-700",
  },

  resolved: {
    label: "Resolvido",
    className: "bg-green-100 text-green-700",
  },

  closed: {
    label: "Finalizado",
    className: "bg-slate-200 text-slate-700",
  },
};

export function CaseStatusBadge({ status }: Props) {
  const current =
    statusMap[status as CaseStatus] ?? statusMap.new;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${current.className}`}
    >
      {current.label}
    </span>
  );
}