import { notFound } from "next/navigation";

import { MaskedInput } from "@/src/components/forms/MaskedInput";
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

function getPublicSubtitle(
  settings: TenantPublicSettingsRow | null,
): string {
  return (
    settings?.public_subtitle ||
    "Atendimento jurídico online com análise inicial organizada."
  );
}

function getPublicDescription(
  settings: TenantPublicSettingsRow | null,
): string {
  return (
    settings?.public_description ||
    "Preencha os dados abaixo para iniciar sua solicitação. O escritório receberá seu caso com as informações organizadas."
  );
}

function getFormIntro(
  settings: TenantPublicSettingsRow | null,
): string {
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

  const whatsappUrl = getWhatsappUrl(
    settings?.whatsapp_number ?? null,
  );

  return (
    <main className="min-h-screen bg-[#0B1D2D] px-4 py-8 md:py-12">
      <section className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="overflow-hidden rounded-[2rem] border border-[#C89B4A]/30 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="p-7 text-white md:p-8">
            <div className="inline-flex rounded-2xl border border-[#C89B4A]/30 bg-[#081827] p-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C89B4A] text-xl font-black text-[#0B1D2D]">
                J
              </span>
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Atendimento jurídico
            </p>

            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
              {getPublicTitle(typedTenant, settings)}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[#D8DEE5]">
              {getPublicSubtitle(settings)}
            </p>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#B8C2CC]">
              {getPublicDescription(settings)}
            </p>

            {settings?.practice_areas &&
            settings.practice_areas.length > 0 ? (
              <div className="mt-8">
                <h2 className="text-sm font-bold text-white">
                  Áreas de atuação
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  {settings.practice_areas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-[#C89B4A]/30 bg-[#132D44] px-3 py-1 text-xs font-semibold text-[#F2EFEA]"
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
                className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Falar no WhatsApp
              </a>
            ) : null}
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8">
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C89B4A]">
                  01
                </p>

                <p className="mt-2 text-sm font-bold text-white">
                  Crie seu acesso
                </p>

                <p className="mt-1 text-xs leading-5 text-[#B8C2CC]">
                  Crie uma conta ou entre com uma conta que já possui.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C89B4A]">
                  02
                </p>

                <p className="mt-2 text-sm font-bold text-white">
                  Envie seu atendimento
                </p>

                <p className="mt-1 text-xs leading-5 text-[#B8C2CC]">
                  Descreva o caso e anexe os documentos disponíveis.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C89B4A]">
                  03
                </p>

                <p className="mt-2 text-sm font-bold text-white">
                  Acompanhe pelo painel
                </p>

                <p className="mt-1 text-xs leading-5 text-[#B8C2CC]">
                  Consulte casos, mensagens, documentos e atualizações.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#F8F6F1] shadow-2xl shadow-black/20">
          <div className="border-b border-[#ECE7DD] bg-white p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Solicitação online
            </p>

            <h2 className="mt-3 text-2xl font-bold text-[#0B1D2D] md:text-3xl">
              Envie seu atendimento
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#5B6472]">
              {getFormIntro(settings)}
            </p>
          </div>

          <div className="p-7 md:p-8">
            {query.error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {query.error}
              </div>
            ) : null}

            <form
              action={createPublicCaseAction}
              className="space-y-5"
            >
              <input
                type="hidden"
                name="tenantId"
                value={typedTenant.id}
              />

              <div className="rounded-2xl border border-[#D8D2C7] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C89B4A]">
                  Acesso ao portal
                </p>

                <h3 className="mt-2 text-lg font-bold text-[#0B1D2D]">
                  Crie ou acesse sua conta
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                  Sua conta permitirá acompanhar este atendimento pelo painel
                  do cliente.
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E7D7B5] bg-[#FFF8E8] p-4">
                    <input
                      type="radio"
                      name="accountMode"
                      value="create"
                      defaultChecked
                      className="mt-1 h-4 w-4 accent-[#C89B4A]"
                    />

                    <span>
                      <span className="block text-sm font-bold text-[#0B1D2D]">
                        Criar minha conta
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#7A5B24]">
                        Escolha esta opção caso ainda não tenha acesso ao
                        JUSCONECT ADV.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] p-4">
                    <input
                      type="radio"
                      name="accountMode"
                      value="login"
                      className="mt-1 h-4 w-4 accent-[#C89B4A]"
                    />

                    <span>
                      <span className="block text-sm font-bold text-[#0B1D2D]">
                        Já tenho uma conta
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#5B6472]">
                        Use o mesmo e-mail e senha, mesmo que sua conta tenha
                        sido criada em outro escritório.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                    Nome completo *
                  </label>

                  <input
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                    Tipo
                  </label>

                  <select
                    name="clientType"
                    className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                  >
                    <option value="PF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                    CPF/CNPJ
                  </label>

                  <MaskedInput
                    name="document"
                    mask="cpfCnpj"
                    placeholder="CPF ou CNPJ"
                    className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                    E-mail *
                  </label>

                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="seu@email.com"
                    className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                    Telefone
                  </label>

                  <MaskedInput
                    name="phone"
                    mask="phone"
                    placeholder="(21) 99999-9999"
                    className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                    Senha de acesso *
                  </label>

                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="current-password"
                    placeholder="Mínimo de 6 caracteres"
                    className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                    Confirmar senha
                  </label>

                  <input
                    name="confirmPassword"
                    type="password"
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Repita a senha ao criar uma conta"
                    className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                  />

                  <p className="mt-2 text-xs leading-5 text-[#5B6472]">
                    Para quem já possui conta, este campo pode ficar vazio.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E7E1D7] pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C89B4A]">
                  Dados do atendimento
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                  Título do caso *
                </label>

                <input
                  name="title"
                  required
                  placeholder="Ex: Problema trabalhista, cobrança indevida, contrato..."
                  className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                  Urgência
                </label>

                <select
                  name="priority"
                  className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                >
                  <option value="medium">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                  <option value="low">Baixa</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                  Conte o que aconteceu *
                </label>

                <textarea
                  name="description"
                  required
                  rows={7}
                  placeholder="Descreva o caso com o máximo de detalhes possível."
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>

              <div className="rounded-2xl border border-[#E7D7B5] bg-[#FFF8E8] p-4">
                <label className="mb-2 block text-sm font-bold text-[#0B1D2D]">
                  Documentos do caso
                </label>

                <input
                  type="file"
                  name="files"
                  multiple
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] file:mr-3 file:rounded-xl file:border-0 file:bg-[#0B1D2D] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                />

                <p className="mt-2 text-xs leading-5 text-[#7A5B24]">
                  Você pode anexar até 10 arquivos. Cada arquivo pode ter até
                  20MB.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D8D2C7] bg-white p-4">
                <p className="text-xs leading-5 text-[#5B6472]">
                  Ao enviar, sua conta será criada ou autenticada e ficará
                  vinculada exclusivamente a este escritório. A mesma conta
                  poderá ser usada em outros escritórios que utilizem o
                  JUSCONECT ADV.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#C89B4A] px-5 py-4 text-sm font-black text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Criar acesso e enviar solicitação
              </button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}