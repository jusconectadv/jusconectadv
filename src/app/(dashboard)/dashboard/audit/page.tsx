import Link from "next/link";

import { listAuditLogs } from "@/src/services/audit-logs";

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    case_created: "Caso criado",
    case_updated: "Caso atualizado",
    case_status_updated: "Status alterado",
    client_created: "Cliente criado",
    client_updated: "Cliente atualizado",
    client_archived: "Cliente arquivado",
    client_restored: "Cliente reativado",
    message_sent: "Mensagem enviada",
    document_uploaded: "Documento enviado",
  };

  return labels[action] ?? action;
}

function getEntityLabel(entityType: string): string {
  const labels: Record<string, string> = {
    case: "Caso",
    client: "Cliente",
    document: "Documento",
    message: "Mensagem",
    task: "Tarefa",
    template: "Template",
  };

  return labels[entityType] ?? entityType;
}

function getActionClassName(action: string): string {
  if (action === "case_created") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (action === "case_updated" || action === "case_status_updated") {
    return "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]";
  }

  if (action === "client_created" || action === "client_restored") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (action === "client_updated") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  if (action === "client_archived") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (action === "message_sent") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (action === "document_uploaded") {
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  }

  return "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
}

function getEntityClassName(entityType: string): string {
  if (entityType === "case") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (entityType === "client") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (entityType === "document") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (entityType === "message") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  if (entityType === "task") {
    return "border-[#E7D7B5] bg-[#FFF8E8] text-[#9E762D]";
  }

  return "border-[#D8D2C7] bg-[#F8F6F1] text-[#5B6472]";
}

function getEntityHref(
  entityType: string,
  entityId: string | null,
): string | null {
  if (!entityId) {
    return null;
  }

  if (entityType === "case") {
    return `/dashboard/cases/${entityId}`;
  }

  if (entityType === "client") {
    return `/dashboard/clients/${entityId}`;
  }

  return null;
}

export default async function AuditPage() {
  const data = await listAuditLogs();

  const caseCreatedCount = data.logs.filter(
    (log) => log.action === "case_created",
  ).length;

  const caseStatusUpdatedCount = data.logs.filter(
    (log) => log.action === "case_status_updated",
  ).length;

  const clientActionsCount = data.logs.filter(
    (log) =>
      log.action === "client_created" ||
      log.action === "client_updated" ||
      log.action === "client_archived" ||
      log.action === "client_restored",
  ).length;

  const communicationActionsCount = data.logs.filter(
    (log) =>
      log.action === "message_sent" || log.action === "document_uploaded",
  ).length;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Segurança e histórico
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Auditoria
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Consulte ações importantes realizadas no escritório. Esta tela
              mostra os últimos registros de auditoria para rastrear eventos
              administrativos e operacionais.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Visão geral
              </Link>

              <Link
                href="/dashboard/activity"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Atividades
              </Link>

              <Link
                href="/dashboard/search"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Busca global
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Resumo dos logs
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Total</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {data.logs.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Casos</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {caseCreatedCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Clientes</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {clientActionsCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1D2D] p-4">
                  <p className="text-[11px] text-[#8FA0AE]">Comunicações</p>
                  <p className="mt-1 text-2xl font-bold text-[#C89B4A]">
                    {communicationActionsCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">Total exibido</p>

          <strong className="mt-2 block text-3xl font-bold text-[#0B1D2D]">
            {data.logs.length}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Registros carregados
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Casos criados</p>

          <strong className="mt-2 block text-3xl font-bold text-blue-700">
            {caseCreatedCount}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Novos atendimentos
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#9E762D]">
            Status alterados
          </p>

          <strong className="mt-2 block text-3xl font-bold text-[#C89B4A]">
            {caseStatusUpdatedCount}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Movimentações de casos
          </p>
        </div>

        <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-700">Arquivamentos</p>

          <strong className="mt-2 block text-3xl font-bold text-red-700">
            {
              data.logs.filter((log) => log.action === "client_archived")
                .length
            }
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Clientes arquivados
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
        <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
            Logs recentes
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
            Registros de auditoria
          </h2>

          <p className="mt-1 text-sm text-[#5B6472]">
            Eventos administrativos e operacionais relevantes.
          </p>
        </div>

        {data.logs.length === 0 ? (
          <div className="p-8">
            <div className="rounded-3xl border border-dashed border-[#D8D2C7] bg-[#F8F6F1] p-8 text-center">
              <p className="text-sm font-bold text-[#0B1D2D]">
                Nenhum log de auditoria registrado ainda.
              </p>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#5B6472]">
                Crie um caso, altere um status ou arquive um cliente para gerar
                os primeiros logs.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#ECE7DD]">
            {data.logs.map((log) => {
              const href = getEntityHref(log.entity_type, log.entity_id);

              return (
                <article
                  key={log.id}
                  className="p-5 transition hover:bg-[#F8F6F1]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getActionClassName(
                            log.action,
                          )}`}
                        >
                          {getActionLabel(log.action)}
                        </span>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getEntityClassName(
                            log.entity_type,
                          )}`}
                        >
                          {getEntityLabel(log.entity_type)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-[#0B1D2D]">
                        {log.description}
                      </h3>

                      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                        <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                            Data
                          </dt>

                          <dd className="mt-1 text-[#0B1D2D]">
                            {formatDateTime(log.created_at)}
                          </dd>
                        </div>

                        <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                            Usuário
                          </dt>

                          <dd className="mt-1 text-[#0B1D2D]">
                            {log.actor_name ??
                              log.actor_email ??
                              "Não identificado"}
                          </dd>
                        </div>

                        <div className="rounded-2xl border border-[#D8D2C7] bg-white p-3">
                          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C89B4A]">
                            ID do registro
                          </dt>

                          <dd className="mt-1 break-all font-mono text-xs leading-5 text-[#0B1D2D]">
                            {log.entity_id ?? "Não informado"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {href ? (
                      <Link
                        href={href}
                        className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
                      >
                        Abrir registro
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
          Observação
        </p>

        <h2 className="mt-2 text-base font-bold text-[#0B1D2D]">
          Auditoria funcional pausada
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
          Por enquanto esta tela está pronta visualmente e lista os logs já
          registrados pelo sistema. A expansão completa de auditoria pode entrar
          depois, com mais eventos, filtros e exportação.
        </p>
      </section>
    </section>
  );
}