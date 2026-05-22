type CasePriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

type Props = {
  priority: string;
};

const priorityMap: Record<
  CasePriority,
  {
    label: string;
    className: string;
  }
> = {
  low: {
    label: "Baixa",
    className: "bg-slate-100 text-slate-700",
  },

  medium: {
    label: "Média",
    className: "bg-blue-100 text-blue-700",
  },

  high: {
    label: "Alta",
    className: "bg-orange-100 text-orange-700",
  },

  urgent: {
    label: "Urgente",
    className: "bg-red-100 text-red-700",
  },
};

export function CasePriorityBadge({
  priority,
}: Props) {
  const current =
    priorityMap[priority as CasePriority] ??
    priorityMap.medium;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${current.className}`}
    >
      {current.label}
    </span>
  );
}