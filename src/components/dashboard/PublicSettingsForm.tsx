import { MaskedInput } from "@/src/components/forms/MaskedInput";
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
      className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
    >
      <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
          Página pública
        </p>

        <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
          Personalização do link público
        </h2>

        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#5B6472]">
          Configure as informações que aparecem para o cliente na página pública
          de captação do escritório.
        </p>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-5">
          <div className="rounded-[1.5rem] border border-[#D8D2C7] bg-[#F8F6F1] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Status
            </p>

            <h3 className="mt-2 text-base font-bold text-[#0B1D2D]">
              Visibilidade pública
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#5B6472]">
              Quando ativo, clientes poderão acessar o link público e abrir uma
              solicitação diretamente para o escritório.
            </p>

            <label className="mt-5 flex items-start gap-3 rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D]">
              <input
                type="checkbox"
                name="isPublicActive"
                defaultChecked={settings?.is_public_active ?? true}
                className="mt-0.5 h-4 w-4 rounded border-[#D8D2C7]"
              />

              <span>
                <strong className="block font-bold">
                  Página pública ativa
                </strong>

                <span className="mt-1 block leading-6 text-[#5B6472]">
                  Permitir que clientes acessem o link público de atendimento.
                </span>
              </span>
            </label>
          </div>

          <div className="rounded-[1.5rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Dica
            </p>

            <h3 className="mt-2 text-base font-bold text-[#0B1D2D]">
              Captação mais clara
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
              Use um título objetivo, uma descrição curta e áreas de atuação
              bem separadas. Isso ajuda o cliente a entender rapidamente como o
              escritório pode ajudar.
            </p>
          </div>
        </aside>

        <div className="grid gap-5">
          <div>
            <label
              htmlFor="publicTitle"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Título principal
            </label>

            <input
              id="publicTitle"
              name="publicTitle"
              defaultValue={settings?.public_title ?? ""}
              placeholder="Ex: Atendimento jurídico especializado"
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="publicSubtitle"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Subtítulo
            </label>

            <input
              id="publicSubtitle"
              name="publicSubtitle"
              defaultValue={settings?.public_subtitle ?? ""}
              placeholder="Ex: Envie sua solicitação para análise do escritório"
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="publicDescription"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Descrição/apresentação
            </label>

            <textarea
              id="publicDescription"
              name="publicDescription"
              defaultValue={settings?.public_description ?? ""}
              rows={4}
              placeholder="Explique brevemente como o escritório atua e como funciona o primeiro atendimento."
              className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>

          <div>
            <label
              htmlFor="whatsappNumber"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              WhatsApp de contato
            </label>

            <MaskedInput
              id="whatsappNumber"
              name="whatsappNumber"
              mask="whatsapp"
              defaultValue={settings?.whatsapp_number ?? ""}
              placeholder="Ex: 55 (21) 99999-9999"
              className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />

            <p className="mt-2 text-xs leading-5 text-[#5B6472]">
              Use DDI + DDD + número. Exemplo: 55 (21) 99999-9999.
            </p>
          </div>

          <div>
            <label
              htmlFor="practiceAreas"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Áreas de atuação
            </label>

            <textarea
              id="practiceAreas"
              name="practiceAreas"
              defaultValue={getPracticeAreasText(settings)}
              rows={5}
              placeholder={`Direito Trabalhista\nDireito do Consumidor\nDireito de Família`}
              className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />

            <p className="mt-2 text-xs leading-5 text-[#5B6472]">
              Informe uma área por linha ou separada por vírgula.
            </p>
          </div>

          <div>
            <label
              htmlFor="formIntro"
              className="mb-2 block text-sm font-bold text-[#0B1D2D]"
            >
              Mensagem acima do formulário
            </label>

            <textarea
              id="formIntro"
              name="formIntro"
              defaultValue={settings?.form_intro ?? ""}
              rows={3}
              placeholder="Ex: Preencha os dados abaixo com o máximo de detalhes possível."
              className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#ECE7DD] bg-[#F8F6F1] p-5 sm:flex-row sm:justify-end">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
        >
          Salvar personalização
        </button>
      </div>
    </form>
  );
}