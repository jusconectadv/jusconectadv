import { updateLawyerPublicSettingsAction } from "@/src/services/lawyer-public-settings";
import type { Database } from "@/src/types/supabase";

type TenantPublicSettingsRow =
  Database["public"]["Tables"]["tenant_public_settings"]["Row"];

type PublicSettingsFormProps = {
  settings: TenantPublicSettingsRow | null;
};

function getPracticeAreasText(settings: TenantPublicSettingsRow | null): string {
  if (!settings) {
    return "";
  }

  return settings.practice_areas.join("\n");
}

export function PublicSettingsForm({ settings }: PublicSettingsFormProps) {
  return (
    <form
      action={updateLawyerPublicSettingsAction}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Página pública do advogado
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Personalize as informações que aparecem no link público de captação.
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Página pública ativa
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isPublicActive"
              defaultChecked={settings?.is_public_active ?? true}
              className="h-4 w-4 rounded border-slate-300"
            />
            Permitir que clientes acessem o link público de atendimento
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Título principal
          </label>

          <input
            name="publicTitle"
            defaultValue={settings?.public_title ?? ""}
            placeholder="Ex: Atendimento jurídico especializado"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Subtítulo
          </label>

          <input
            name="publicSubtitle"
            defaultValue={settings?.public_subtitle ?? ""}
            placeholder="Ex: Envie sua solicitação para análise do escritório"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Descrição/apresentação
          </label>

          <textarea
            name="publicDescription"
            defaultValue={settings?.public_description ?? ""}
            rows={4}
            placeholder="Explique brevemente como o escritório atua e como funciona o primeiro atendimento."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            WhatsApp de contato
          </label>

          <input
            name="whatsappNumber"
            defaultValue={settings?.whatsapp_number ?? ""}
            placeholder="Ex: 5521999999999"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
          />

          <p className="mt-1 text-xs text-slate-500">
            Use somente números com DDI e DDD. Exemplo: 5521999999999.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Áreas de atuação
          </label>

          <textarea
            name="practiceAreas"
            defaultValue={getPracticeAreasText(settings)}
            rows={5}
            placeholder={`Direito Trabalhista\nDireito do Consumidor\nDireito de Família`}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
          />

          <p className="mt-1 text-xs text-slate-500">
            Informe uma área por linha ou separada por vírgula.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Mensagem acima do formulário
          </label>

          <textarea
            name="formIntro"
            defaultValue={settings?.form_intro ?? ""}
            rows={3}
            placeholder="Ex: Preencha os dados abaixo com o máximo de detalhes possível."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Salvar personalização
        </button>
      </div>
    </form>
  );
}