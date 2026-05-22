import { notFound } from "next/navigation";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createPublicCaseAction } from "@/src/services/public-intake";
import type { Database } from "@/src/types/supabase";

type TenantPublicSettingsRow =
  Database["public"]["Tables"]["tenant_public_settings"]["Row"];

type LawyerPublicPageProps = {
  params: Promise<{
    tenantId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

type PublicTenant = {
  id: string;
  name: string;
  active: boolean;
};

function getPublicTitle(
  tenant: PublicTenant,
  settings: TenantPublicSettingsRow | null,
): string {
  return settings?.public_title || tenant.name;
}

function getPublicSubtitle(settings: TenantPublicSettingsRow | null): string {
  return (
    settings?.public_subtitle ||
    "Atendimento jurídico online com análise inicial organizada."
  );
}

function getPublicDescription(settings: TenantPublicSettingsRow | null): string {
  return (
    settings?.public_description ||
    "Preencha os dados abaixo para iniciar sua solicitação. O escritório receberá seu caso com as informações organizadas."
  );
}

function getFormIntro(settings: TenantPublicSettingsRow | null): string {
  return (
    settings?.form_intro ||
    "Conte com detalhes o que aconteceu para que o escritório possa avaliar melhor sua solicitação."
  );
}

function getWhatsappUrl(number: string | null): string | null {
  if (!number) {
    return null;
  }

  const cleanNumber = number.replace(/\D/g, "");

  if (!cleanNumber) {
    return null;
  }

  return `https://wa.me/${cleanNumber}`;
}

export default async function LawyerPublicPage({
  params,
  searchParams,
}: LawyerPublicPageProps) {
  const { tenantId } = await params;
  const query = await searchParams;

  const supabase = createSupabaseAdminClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, active")
    .eq("id", tenantId)
    .eq("active", true)
    .single();

  if (!tenant) {
    notFound();
  }

  const typedTenant: PublicTenant = {
    id: tenant.id,
    name: tenant.name,
    active: tenant.active,
  };

  const { data: settings } = await supabase
    .from("tenant_public_settings")
    .select("*")
    .eq("tenant_id", typedTenant.id)
    .maybeSingle();

  if (settings && !settings.is_public_active) {
    notFound();
  }

  const whatsappUrl = getWhatsappUrl(settings?.whatsapp_number ?? null);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            Atendimento jurídico
          </p>

          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            {getPublicTitle(typedTenant, settings)}
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-200">
            {getPublicSubtitle(settings)}
          </p>

          <p className="mt-5 text-sm leading-7 text-slate-300">
            {getPublicDescription(settings)}
          </p>

          {settings?.practice_areas && settings.practice_areas.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-white">
                Áreas de atuação
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {settings.practice_areas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
            >
              Falar no WhatsApp
            </a>
          ) : null}
        </div>

        <section className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Solicitação online
            </p>

            <h2 className="mt-3 text-2xl font-bold text-slate-950">
              Envie seu atendimento
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {getFormIntro(settings)}
            </p>
          </div>

          {query.error ? (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {query.error}
            </div>
          ) : null}

          <form action={createPublicCaseAction} className="space-y-5">
            <input type="hidden" name="tenantId" value={typedTenant.id} />

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nome completo *
                </label>
                <input
                  name="name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tipo
                </label>
                <select
                  name="clientType"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="PF">Pessoa Física</option>
                  <option value="PJ">Pessoa Jurídica</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  CPF/CNPJ
                </label>
                <input
                  name="document"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Telefone
                </label>
                <input
                  name="phone"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Título do caso *
              </label>
              <input
                name="title"
                required
                placeholder="Ex: Problema trabalhista, cobrança indevida, contrato..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Urgência
              </label>
              <select
                name="priority"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="medium">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
                <option value="low">Baixa</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Conte o que aconteceu *
              </label>
              <textarea
                name="description"
                required
                rows={7}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-slate-950 px-4 py-3 font-medium text-white hover:bg-slate-800"
            >
              Enviar solicitação
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}