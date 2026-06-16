import Link from "next/link";

import { CopyPublicIntakeLinkButton } from "@/src/components/dashboard/CopyPublicIntakeLinkButton";
import { PublicSettingsForm } from "@/src/components/dashboard/PublicSettingsForm";
import { getLawyerPublicSettings } from "@/src/services/lawyer-public-settings";
import { getLawyerSettings } from "@/src/services/lawyer-settings";

type DashboardSettingsPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

function getStatusLabel(active: boolean | null): string {
  if (active === false) {
    return "Inativo";
  }

  return "Ativo";
}

function getStatusClassName(active: boolean | null): string {
  if (active === false) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getPlanLabel(plan: string | null): string {
  if (!plan) {
    return "Plano não informado";
  }

  return plan;
}

export default async function DashboardSettingsPage({
  searchParams,
}: DashboardSettingsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const settings = await getLawyerSettings();
  const publicSettings = await getLawyerPublicSettings();

  const tenant = settings.tenant;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Sistema do escritório
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Configurações
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Consulte os dados principais do escritório e personalize o link
              público usado para captação de novos atendimentos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={settings.public_intake_path}
              target="_blank"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Abrir link público
            </Link>

            <CopyPublicIntakeLinkButton path={settings.public_intake_path} />
          </div>
        </header>

        {resolvedSearchParams.success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            Configurações públicas atualizadas com sucesso.
          </div>
        ) : null}

        {resolvedSearchParams.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-950">
              Dados do escritório
            </h2>

            <dl className="mt-5 grid gap-5 text-sm md:grid-cols-2">
              <div>
                <dt className="font-medium text-slate-500">
                  Nome do escritório
                </dt>
                <dd className="mt-1 text-slate-950">{tenant.name}</dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Plano</dt>
                <dd className="mt-1 text-slate-950">
                  {getPlanLabel(tenant.plan)}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">Status</dt>
                <dd className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                      tenant.active,
                    )}`}
                  >
                    {getStatusLabel(tenant.active)}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">ID do tenant</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                  {tenant.id}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-slate-500">
                  ID do proprietário
                </dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                  {tenant.owner_id}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Link público
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Esse é o link que o advogado pode enviar para clientes abrirem uma
              solicitação pública.
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="break-all font-mono text-xs text-slate-700">
                {settings.public_intake_path}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <CopyPublicIntakeLinkButton path={settings.public_intake_path} />

              <Link
                href={settings.public_intake_path}
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Testar página pública
              </Link>
            </div>
          </div>
        </section>

        <PublicSettingsForm settings={publicSettings.settings} />

        <section className="grid gap-4 md:grid-cols-4">
          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md"
          >
            Voltar para visão geral
          </Link>

          <Link
            href="/dashboard/cases"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md"
          >
            Ver casos
          </Link>

          <Link
            href="/dashboard/clients"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md"
          >
            Ver clientes
          </Link>

          <Link
            href="/dashboard/activity"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md"
          >
            Ver atividades
          </Link>
        </section>
      </div>
    </main>
  );
}