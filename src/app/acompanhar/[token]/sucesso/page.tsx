import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/supabase";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type TenantPublicSettingsRow =
  Database["public"]["Tables"]["tenant_public_settings"]["Row"];

type SuccessPageProps = {
  params: Promise<{
    token: string;
  }>;
};

type SuccessData = {
  legalCase: CaseRow;
  tenant: TenantRow;
  client: ClientRow | null;
  publicSettings: TenantPublicSettingsRow | null;
};

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

async function getSuccessData(token: string): Promise<SuccessData> {
  const supabase = createSupabaseAdminClient();

  const { data: legalCase, error: caseError } = await supabase
    .from("cases")
    .select("*")
    .eq("public_token", token)
    .single();

  if (caseError || !legalCase) {
    notFound();
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", legalCase.tenant_id)
    .eq("active", true)
    .single();

  if (tenantError || !tenant) {
    notFound();
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", legalCase.client_id)
    .eq("tenant_id", legalCase.tenant_id)
    .maybeSingle();

  const { data: publicSettings } = await supabase
    .from("tenant_public_settings")
    .select("*")
    .eq("tenant_id", legalCase.tenant_id)
    .maybeSingle();

  return {
    legalCase,
    tenant,
    client: client ?? null,
    publicSettings: publicSettings ?? null,
  };
}

export default async function PublicCaseSuccessPage({
  params,
}: SuccessPageProps) {
  const { token } = await params;
  const data = await getSuccessData(token);

  const whatsappUrl = getWhatsappUrl(
    data.publicSettings?.whatsapp_number ?? null,
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl font-bold text-emerald-700">
          ✓
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Solicitação enviada
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Atendimento recebido com sucesso
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Seu caso foi enviado para o escritório{" "}
            <strong>{data.tenant.name}</strong>. Agora você pode acompanhar o
            andamento pelo link abaixo.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-sm font-semibold text-slate-950">
            Dados do atendimento
          </h2>

          <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">Caso</dt>
              <dd className="mt-1 text-slate-950">{data.legalCase.title}</dd>
            </div>

            <div>
              <dt className="font-medium text-slate-500">Cliente</dt>
              <dd className="mt-1 text-slate-950">
                {data.client?.name ?? "Não informado"}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-slate-500">Enviado em</dt>
              <dd className="mt-1 text-slate-950">
                {formatDateTime(data.legalCase.created_at)}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-slate-500">
                Código de acompanhamento
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                {token}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-sm font-semibold text-blue-900">
            Próximo passo
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            Guarde este link de acompanhamento. Por ele você poderá visualizar o
            andamento do caso, enviar novas mensagens e anexar documentos quando
            necessário.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <Link
            href={`/acompanhar/${token}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Acompanhar atendimento
          </Link>

          <Link
            href={`/advogado/${data.tenant.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Voltar ao formulário
          </Link>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              Falar no WhatsApp
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}