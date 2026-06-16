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
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-yellow-50 text-yellow-700",
  urgent: "bg-red-50 text-red-700",
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

export async function CaseTasksSection({ caseId }: CaseTasksSectionProps) {
  const tasks = await getCaseTasks(caseId);

  const pendingTasks = tasks.filter((task) => task.status !== "done");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-semibold text-slate-950">Tarefas e prazos</h2>

        <p className="mt-1 text-sm text-slate-500">
          Controle atividades internas do caso. O cliente não visualiza essas
          tarefas.
        </p>
      </div>

      <form action={createCaseTaskAction} className="mt-5 space-y-4">
        <input type="hidden" name="caseId" value={caseId} />

        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-slate-700"
          >
            Tarefa
          </label>

          <input
            id="task-title"
            name="title"
            type="text"
            required
            placeholder="Ex: Solicitar contrato original"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-950"
          />
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="block text-sm font-medium text-slate-700"
          >
            Observação
          </label>

          <textarea
            id="task-description"
            name="description"
            rows={3}
            placeholder="Detalhe opcional da tarefa..."
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-medium text-slate-700"
            >
              Prioridade
            </label>

            <select
              id="task-priority"
              name="priority"
              defaultValue="medium"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-950"
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
              className="block text-sm font-medium text-slate-700"
            >
              Prazo
            </label>

            <input
              id="task-due-date"
              name="dueDate"
              type="date"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-950"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Criar tarefa
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-950">
              Pendentes
            </h3>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {pendingTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Nenhuma tarefa pendente.
              </div>
            ) : (
              pendingTasks.map((task) => {
                const overdue = isOverdue(task.due_date, task.status);

                return (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              priorityClasses[task.priority] ??
                              priorityClasses.medium
                            }`}
                          >
                            {priorityLabels[task.priority] ?? task.priority}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              overdue
                                ? "bg-red-50 text-red-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {overdue
                              ? `Atrasada: ${formatDate(task.due_date)}`
                              : formatDate(task.due_date)}
                          </span>
                        </div>

                        <h4 className="mt-3 font-semibold text-slate-950">
                          {task.title}
                        </h4>

                        {task.description ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {task.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap justify-end gap-3">
                        <form action={updateCaseTaskStatusAction}>
                          <input type="hidden" name="caseId" value={caseId} />
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="status" value="done" />

                          <button
                            type="submit"
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                          >
                            Concluir
                          </button>
                        </form>

                        <form action={deleteCaseTaskAction}>
                          <input type="hidden" name="caseId" value={caseId} />
                          <input type="hidden" name="taskId" value={task.id} />

                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-950">
              Concluídas
            </h3>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {doneTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {doneTasks.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Nenhuma tarefa concluída.
              </div>
            ) : (
              doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 opacity-80"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          Concluída
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            priorityClasses[task.priority] ??
                            priorityClasses.medium
                          }`}
                        >
                          {priorityLabels[task.priority] ?? task.priority}
                        </span>
                      </div>

                      <h4 className="mt-3 font-semibold text-slate-950 line-through decoration-slate-400">
                        {task.title}
                      </h4>

                      {task.description ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {task.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                      <form action={updateCaseTaskStatusAction}>
                        <input type="hidden" name="caseId" value={caseId} />
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="status" value="pending" />

                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Reabrir
                        </button>
                      </form>

                      <form action={deleteCaseTaskAction}>
                        <input type="hidden" name="caseId" value={caseId} />
                        <input type="hidden" name="taskId" value={task.id} />

                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
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