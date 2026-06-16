import {
  createCaseTaskAction,
  deleteCaseTaskAction,
  getCaseTasks,
  updateCaseTaskStatusAction,
} from "@/src/services/case-tasks";

type CaseTasksSectionProps = {
  caseId: string;
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const priorityClasses: Record<string, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-blue-200 bg-blue-50 text-blue-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  urgent: "border-red-200 bg-red-50 text-red-700",
};

function formatDate(date: string | null): string {
  if (!date) {
    return "Sem prazo";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
}

function isOverdue(date: string | null, status: string): boolean {
  if (!date || status === "done") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${date}T00:00:00`);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function isDueToday(date: string | null, status: string): boolean {
  if (!date || status === "done") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${date}T00:00:00`);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate.getTime() === today.getTime();
}

function getDueDateClassName(params: {
  dueDate: string | null;
  status: string;
}): string {
  if (isOverdue(params.dueDate, params.status)) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (isDueToday(params.dueDate, params.status)) {
    return "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]";
  }

  return "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
}

function getDueDateLabel(params: {
  dueDate: string | null;
  status: string;
}): string {
  if (isOverdue(params.dueDate, params.status)) {
    return `Atrasada: ${formatDate(params.dueDate)}`;
  }

  if (isDueToday(params.dueDate, params.status)) {
    return "Vence hoje";
  }

  return formatDate(params.dueDate);
}

export async function CaseTasksSection({ caseId }: CaseTasksSectionProps) {
  const tasks = await getCaseTasks(caseId);

  const pendingTasks = tasks.filter((task) => task.status !== "done");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
      <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
          Operacional
        </p>

        <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
          Tarefas e prazos
        </h2>

        <p className="mt-1 text-sm leading-6 text-[#5B6472]">
          Controle atividades internas do caso. O cliente não visualiza essas
          tarefas.
        </p>
      </div>

      <form action={createCaseTaskAction} className="space-y-4 p-5">
        <input type="hidden" name="caseId" value={caseId} />

        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-bold text-[#0B1D2D]"
          >
            Tarefa
          </label>

          <input
            id="task-title"
            name="title"
            type="text"
            required
            placeholder="Ex: Solicitar contrato original"
            className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
          />
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="block text-sm font-bold text-[#0B1D2D]"
          >
            Observação
          </label>

          <textarea
            id="task-description"
            name="description"
            rows={3}
            placeholder="Detalhe opcional da tarefa..."
            className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-bold text-[#0B1D2D]"
            >
              Prioridade
            </label>

            <select
              id="task-priority"
              name="priority"
              defaultValue="medium"
              className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="task-due-date"
              className="block text-sm font-bold text-[#0B1D2D]"
            >
              Prazo
            </label>

            <input
              id="task-due-date"
              name="dueDate"
              type="date"
              className="mt-2 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-[#0B1D2D] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#132D44]"
          >
            Criar tarefa
          </button>
        </div>
      </form>

      <div className="space-y-6 border-t border-[#ECE7DD] p-5">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#0B1D2D]">Pendentes</h3>

            <span className="rounded-full border border-[#D8D2C7] bg-[#F8F6F1] px-3 py-1 text-xs font-bold text-[#5B6472]">
              {pendingTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-4 text-sm text-[#5B6472]">
                Nenhuma tarefa pendente.
              </div>
            ) : (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] p-4 transition hover:border-[#C89B4A]/60"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            priorityClasses[task.priority] ??
                            priorityClasses.medium
                          }`}
                        >
                          {priorityLabels[task.priority] ?? task.priority}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getDueDateClassName(
                            {
                              dueDate: task.due_date,
                              status: task.status,
                            },
                          )}`}
                        >
                          {getDueDateLabel({
                            dueDate: task.due_date,
                            status: task.status,
                          })}
                        </span>
                      </div>

                      <h4 className="mt-3 font-bold text-[#0B1D2D]">
                        {task.title}
                      </h4>

                      {task.description ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5B6472]">
                          {task.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <form action={updateCaseTaskStatusAction}>
                        <input type="hidden" name="caseId" value={caseId} />
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="status" value="done" />

                        <button
                          type="submit"
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Concluir
                        </button>
                      </form>

                      <form action={deleteCaseTaskAction}>
                        <input type="hidden" name="caseId" value={caseId} />
                        <input type="hidden" name="taskId" value={task.id} />

                        <button
                          type="submit"
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                        >
                          Excluir
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#0B1D2D]">Concluídas</h3>

            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {doneTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {doneTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-4 text-sm text-[#5B6472]">
                Nenhuma tarefa concluída.
              </div>
            ) : (
              doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                          Concluída
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            priorityClasses[task.priority] ??
                            priorityClasses.medium
                          }`}
                        >
                          {priorityLabels[task.priority] ?? task.priority}
                        </span>
                      </div>

                      <h4 className="mt-3 font-bold text-[#0B1D2D]">
                        {task.title}
                      </h4>

                      {task.description ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5B6472]">
                          {task.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <form action={updateCaseTaskStatusAction}>
                        <input type="hidden" name="caseId" value={caseId} />
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="status" value="pending" />

                        <button
                          type="submit"
                          className="rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-xs font-bold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                        >
                          Reabrir
                        </button>
                      </form>

                      <form action={deleteCaseTaskAction}>
                        <input type="hidden" name="caseId" value={caseId} />
                        <input type="hidden" name="taskId" value={task.id} />

                        <button
                          type="submit"
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                        >
                          Excluir
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}