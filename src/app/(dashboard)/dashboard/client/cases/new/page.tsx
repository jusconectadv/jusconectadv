import Link from "next/link";

import { getClientServiceGuide } from "@/src/lib/client-service-guides";
import { createAuthenticatedClientCaseAction } from "@/src/services/client-dashboard";

type NewClientCasePageProps = {
  searchParams: Promise<{
    error?: string;
    service?: string;
  }>;
};

export default async function NewClientCasePage({
  searchParams,
}: NewClientCasePageProps) {
  const query = await searchParams;
  const guide = getClientServiceGuide(query.service);

  const suggestedTitle =
    guide.id === "outros" ? "" : `Atendimento: ${guide.title}`;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid xl:grid-cols-[1.35fr_0.65fr]">
          <div className="p-7 md:p-8">
            <Link
              href="/dashboard/client/services"
              className="inline-flex text-sm font-semibold text-[#C89B4A] transition hover:text-[#D9AE5F]"
            >
              ← Voltar para serviços
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Novo atendimento
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              {guide.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#B8C2CC]">
              {guide.summary}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {guide.examples.map((example) => (
                <span
                  key={example}
                  className="rounded-full border border-[#C89B4A]/30 bg-[#132D44] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Preenchimento simples
              </p>

              <p className="mt-3 text-sm leading-6 text-[#D8DEE5]">
                Não precisa utilizar termos jurídicos. Conte o que aconteceu com
                suas próprias palavras.
              </p>

              <p className="mt-3 text-sm leading-6 text-[#D8DEE5]">
                Depois do envio, você poderá conversar com o escritório e anexar
                documentos.
              </p>
            </div>
          </div>
        </div>
      </header>

      {query.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {query.error}
        </div>
      ) : null}

      <form
        action={createAuthenticatedClientCaseAction}
        className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]"
      >
        <input type="hidden" name="serviceId" value={guide.id} />
        <input type="hidden" name="serviceTitle" value={guide.title} />
        <input type="hidden" name="serviceCategory" value={guide.category} />

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
            <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
                Serviço escolhido
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B1D2D]">
                {guide.title}
              </h2>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8FA0AE]">
                  Categoria
                </p>
                <p className="mt-1 text-sm font-bold text-[#0B1D2D]">
                  {guide.category}
                </p>
              </div>

              <p className="text-sm leading-6 text-[#5B6472]">
                {guide.summary}
              </p>

              <Link
                href="/dashboard/client/services"
                className="inline-flex rounded-xl border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
              >
                Escolher outro serviço
              </Link>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Dica
            </p>

            <h2 className="mt-2 text-base font-bold text-[#0B1D2D]">
              Quanto mais detalhes, melhor
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
              Informe datas, valores, nomes, empresas, protocolos e documentos
              que já possui.
            </p>
          </section>
        </aside>

        <section className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm">
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Conte sua situação
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#0B1D2D]">
              Informações do atendimento
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#5B6472]">
              Os campos marcados com * são obrigatórios.
            </p>
          </div>

          <div className="grid gap-5 p-5 md:p-6">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Título do atendimento *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={suggestedTitle}
                placeholder="Dê um nome simples para sua solicitação"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div>
              <label
                htmlFor="situation"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                O que aconteceu? *
              </label>

              <textarea
                id="situation"
                name="situation"
                required
                rows={7}
                placeholder={guide.situationPlaceholder}
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div>
              <label
                htmlFor="objective"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                O que você precisa do escritório? *
              </label>

              <textarea
                id="objective"
                name="objective"
                required
                rows={4}
                placeholder={guide.objectivePlaceholder}
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="importantDates"
                  className="mb-2 block text-sm font-bold text-[#0B1D2D]"
                >
                  Datas ou prazos importantes
                </label>

                <textarea
                  id="importantDates"
                  name="importantDates"
                  rows={4}
                  placeholder="Ex: aconteceu em 10/06/2026 e recebi prazo até 25/06/2026."
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="involvedParties"
                  className="mb-2 block text-sm font-bold text-[#0B1D2D]"
                >
                  Pessoas ou empresas envolvidas
                </label>

                <textarea
                  id="involvedParties"
                  name="involvedParties"
                  rows={4}
                  placeholder="Informe nomes, empresas ou órgãos relacionados."
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="availableDocuments"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Quais documentos você possui?
              </label>

              <textarea
                id="availableDocuments"
                name="availableDocuments"
                rows={3}
                placeholder="Ex: contrato, prints, recibos, comprovantes, mensagens ou notificações."
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm leading-6 text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              />
            </div>
            <section className="overflow-hidden rounded-3xl border border-[#E7D7B5] bg-[#FFF8E8]">
              <div className="border-b border-[#E7D7B5] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
                  Documentos e comprovantes
                </p>

                <h3 className="mt-2 text-lg font-bold text-[#0B1D2D]">
                  Deseja enviar algum arquivo?
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#7A5B24]">
                  Você pode anexar contratos, prints, recibos, fotos,
                  notificações, comprovantes e outros documentos relacionados ao
                  atendimento.
                </p>
              </div>

              <div className="p-5">
                <label
                  htmlFor="files"
                  className="mb-2 block text-sm font-bold text-[#0B1D2D]"
                >
                  Selecionar arquivos
                </label>

                <input
                  id="files"
                  name="files"
                  type="file"
                  multiple
                  className="block w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] file:mr-4 file:rounded-xl file:border-0 file:bg-[#0B1D2D] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-[#132D44]"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#E7D7B5] bg-white px-3 py-1 text-xs font-semibold text-[#7A5B24]">
                    Até 10 arquivos
                  </span>

                  <span className="rounded-full border border-[#E7D7B5] bg-white px-3 py-1 text-xs font-semibold text-[#7A5B24]">
                    Máximo de 20 MB por arquivo
                  </span>

                  <span className="rounded-full border border-[#E7D7B5] bg-white px-3 py-1 text-xs font-semibold text-[#7A5B24]">
                    Envio opcional
                  </span>
                </div>
              </div>
            </section>
            <div>
              <label
                htmlFor="priority"
                className="mb-2 block text-sm font-bold text-[#0B1D2D]"
              >
                Qual é a urgência?
              </label>

              <select
                id="priority"
                name="priority"
                defaultValue="medium"
                className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
              >
                <option value="low">Sem urgência</option>
                <option value="medium">Normal</option>
                <option value="high">Importante</option>
                <option value="urgent">Urgente ou com prazo próximo</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#ECE7DD] bg-[#F8F6F1] p-5 sm:flex-row sm:justify-end md:p-6">
            <Link
              href="/dashboard/client/services"
              className="inline-flex items-center justify-center rounded-xl border border-[#D8D2C7] bg-white px-5 py-3 text-sm font-semibold text-[#0B1D2D] transition hover:border-[#C89B4A] hover:text-[#9E762D]"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-6 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
            >
              Enviar solicitação
            </button>
          </div>
        </section>
      </form>
    </section>
  );
}
