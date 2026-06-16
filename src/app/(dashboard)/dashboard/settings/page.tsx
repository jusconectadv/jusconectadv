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
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Sistema do escritório
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Configurações
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8C2CC]">
              Consulte os dados principais do escritório e personalize o link
              público usado para captação de novos atendimentos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={settings.public_intake_path}
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Abrir link público
              </Link>

              <Link
                href="/dashboard/team"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
              >
                Equipe
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-4 py-2 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Visão geral
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Link público
              </p>

              <div className="mt-5 rounded-2xl bg-[#0B1D2D] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA0AE]">
                  Página de captação
                </p>

                <p className="mt-2 break-all font-mono text-xs leading-5 text-white">
                  {settings.public_intake_path}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <CopyPublicIntakeLinkButton path={settings.public_intake_path} />

                <Link
                  href={settings.public_intake_path}
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-white/10"
                >
                  Testar página pública
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {resolvedSearchParams.success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          Configurações públicas atualizadas com sucesso.
        </div>
      ) : null}

      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#5B6472]">
            Nome do escritório
          </p>

          <strong className="mt-2 block text-xl font-bold text-[#0B1D2D]">
            {tenant.name}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Identificação principal
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Plano</p>

          <strong className="mt-2 block text-xl font-bold text-blue-700">
            {getPlanLabel(tenant.plan)}
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Plano atual do tenant
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">Status</p>

          <span
            className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClassName(
              tenant.active,
            )}`}
          >
            {getStatusLabel(tenant.active)}
          </span>

          <p className="mt-3 text-xs text-[#5B6472]">
            Situação do escritório
          </p>
        </div>

        <Link
          href={settings.public_intake_path}
          target="_blank"
          className="rounded-3xl border border-[#E7D7B5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/60 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-[#9E762D]">Página pública</p>

          <strong className="mt-2 block text-base font-bold text-[#0B1D2D]">
            Abrir captação
          </strong>

          <p className="mt-2 text-xs text-[#5B6472]">
            Testar link externo
          </p>
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Escritório
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Dados do escritório
            </h2>

            <p className="mt-1 text-sm text-[#5B6472]">
              Informações estruturais do tenant vinculado ao advogado.
            </p>
          </div>

          <dl className="grid gap-5 p-5 text-sm md:grid-cols-2">
            <div className="rounded-2xl border border-[#D8D2C7] bg-white p-4">
              <dt className="font-semibold text-[#5B6472]">
                Nome do escritório
              </dt>

              <dd className="mt-1 font-bold text-[#0B1D2D]">{tenant.name}</dd>
            </div>

            <div className="rounded-2xl border border-[#D8D2C7] bg-white p-4">
              <dt className="font-semibold text-[#5B6472]">Plano</dt>

              <dd className="mt-1 font-bold text-[#0B1D2D]">
                {getPlanLabel(tenant.plan)}
              </dd>
            </div>

            <div className="rounded-2xl border border-[#D8D2C7] bg-white p-4">
              <dt className="font-semibold text-[#5B6472]">Status</dt>

              <dd className="mt-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClassName(
                    tenant.active,
                  )}`}
                >
                  {getStatusLabel(tenant.active)}
                </span>
              </dd>
            </div>

            <div className="rounded-2xl border border-[#D8D2C7] bg-white p-4">
              <dt className="font-semibold text-[#5B6472]">ID do tenant</dt>

              <dd className="mt-2 break-all font-mono text-xs leading-5 text-[#0B1D2D]">
                {tenant.id}
              </dd>
            </div>

            <div className="rounded-2xl border border-[#D8D2C7] bg-white p-4 md:col-span-2">
              <dt className="font-semibold text-[#5B6472]">
                ID do proprietário
              </dt>

              <dd className="mt-2 break-all font-mono text-xs leading-5 text-[#0B1D2D]">
                {tenant.owner_id}
              </dd>
            </div>
          </dl>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Captação
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
              Link público
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#5B6472]">
              Esse é o link que o advogado pode enviar para clientes abrirem uma
              solicitação pública.
            </p>
          </div>

          <div className="p-5">
            <div className="rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] p-4">
              <p className="break-all font-mono text-xs leading-5 text-[#0B1D2D]">
                {settings.public_intake_path}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <CopyPublicIntakeLinkButton path={settings.public_intake_path} />

              <Link
                href={settings.public_intake_path}
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
              >
                Testar página pública
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicSettingsForm settings={publicSettings.settings} />

      <section className="grid gap-4 md:grid-cols-4">
        <Link
          href="/dashboard"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 text-sm font-semibold text-[#0B1D2D] shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/60 hover:text-[#9E762D] hover:shadow-md"
        >
          Voltar para visão geral
        </Link>

        <Link
          href="/dashboard/cases"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 text-sm font-semibold text-[#0B1D2D] shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/60 hover:text-[#9E762D] hover:shadow-md"
        >
          Ver casos
        </Link>

        <Link
          href="/dashboard/clients"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 text-sm font-semibold text-[#0B1D2D] shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/60 hover:text-[#9E762D] hover:shadow-md"
        >
          Ver clientes
        </Link>

        <Link
          href="/dashboard/activity"
          className="rounded-3xl border border-[#D8D2C7] bg-white p-5 text-sm font-semibold text-[#0B1D2D] shadow-sm transition hover:-translate-y-0.5 hover:border-[#C89B4A]/60 hover:text-[#9E762D] hover:shadow-md"
        >
          Ver atividades
        </Link>
      </section>
    </section>
  );
}