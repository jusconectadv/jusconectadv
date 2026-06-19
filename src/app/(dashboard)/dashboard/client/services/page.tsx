import Link from "next/link";

type ClientService = {
  id: string;
  title: string;
  description: string;
  examples: readonly string[];
  icon: string;
  accent: string;
  softBackground: string;
  border: string;
};

type ServiceGroup = {
  title: string;
  description: string;
  services: readonly ClientService[];
};

const serviceGroups: readonly ServiceGroup[] = [
  {
    title: "Trabalho e previdência",
    description:
      "Questões relacionadas ao trabalho, benefícios, aposentadoria e direitos profissionais.",
    services: [
      {
        id: "problema-trabalhista",
        title: "Problema trabalhista",
        description:
          "Orientação sobre vínculo de trabalho, pagamentos, direitos e problemas com empregadores.",
        examples: [
          "Demissão ou rescisão",
          "Salários e benefícios",
          "Horas extras e férias",
        ],
        icon: "⚖️",
        accent: "text-blue-700",
        softBackground: "bg-blue-50",
        border: "border-blue-200",
      },
      {
        id: "previdencia-beneficios",
        title: "Previdência e benefícios",
        description:
          "Atendimento sobre aposentadoria, benefícios, auxílio e questões relacionadas ao INSS.",
        examples: [
          "Aposentadoria",
          "Auxílio e benefícios",
          "Revisão previdenciária",
        ],
        icon: "🛡️",
        accent: "text-emerald-700",
        softBackground: "bg-emerald-50",
        border: "border-emerald-200",
      },
      {
        id: "relacao-com-funcionarios",
        title: "Relação com funcionários",
        description:
          "Orientação para empresas sobre contratação, desligamento e prevenção de problemas trabalhistas.",
        examples: [
          "Contratação",
          "Desligamento",
          "Regularização interna",
        ],
        icon: "👥",
        accent: "text-cyan-700",
        softBackground: "bg-cyan-50",
        border: "border-cyan-200",
      },
    ],
  },
  {
    title: "Empresas e negócios",
    description:
      "Soluções jurídicas para empresas, profissionais autônomos, MEIs e organizações.",
    services: [
      {
        id: "abertura-regularizacao-empresa",
        title: "Abertura e regularização",
        description:
          "Ajuda para abrir, alterar ou regularizar empresas, negócios e atividades profissionais.",
        examples: [
          "Abertura de empresa",
          "Regularização de MEI",
          "Alterações cadastrais",
        ],
        icon: "🏢",
        accent: "text-amber-700",
        softBackground: "bg-amber-50",
        border: "border-amber-200",
      },
      {
        id: "contratos-empresariais",
        title: "Contratos empresariais",
        description:
          "Criação, revisão e análise de contratos entre empresas, clientes, fornecedores e parceiros.",
        examples: [
          "Prestação de serviços",
          "Fornecedores",
          "Parcerias comerciais",
        ],
        icon: "📄",
        accent: "text-indigo-700",
        softBackground: "bg-indigo-50",
        border: "border-indigo-200",
      },
      {
        id: "cobranca-inadimplencia",
        title: "Cobrança e inadimplência",
        description:
          "Orientação para recuperar valores, formalizar cobranças e negociar débitos.",
        examples: [
          "Cliente devedor",
          "Cobrança extrajudicial",
          "Negociação de dívida",
        ],
        icon: "💰",
        accent: "text-green-700",
        softBackground: "bg-green-50",
        border: "border-green-200",
      },
      {
        id: "socios-empresa",
        title: "Sócios e organização empresarial",
        description:
          "Atendimento para conflitos, alterações societárias e responsabilidades entre sócios.",
        examples: [
          "Entrada ou saída de sócio",
          "Conflitos societários",
          "Responsabilidades",
        ],
        icon: "🤝",
        accent: "text-violet-700",
        softBackground: "bg-violet-50",
        border: "border-violet-200",
      },
      {
        id: "licitacoes",
        title: "Licitações",
        description:
          "Análise de editais, documentos, habilitação, recursos e participação em processos públicos.",
        examples: [
          "Análise de edital",
          "Documentação",
          "Recursos e impugnações",
        ],
        icon: "🏛️",
        accent: "text-slate-700",
        softBackground: "bg-slate-50",
        border: "border-slate-200",
      },
      {
        id: "tributario",
        title: "Questões tributárias",
        description:
          "Atendimento relacionado a impostos, débitos, parcelamentos e regularização fiscal.",
        examples: [
          "Débitos fiscais",
          "Parcelamentos",
          "Regularização tributária",
        ],
        icon: "🧾",
        accent: "text-orange-700",
        softBackground: "bg-orange-50",
        border: "border-orange-200",
      },
    ],
  },
  {
    title: "Contratos, patrimônio e família",
    description:
      "Atendimentos relacionados a contratos, imóveis, bens, família e organização patrimonial.",
    services: [
      {
        id: "revisao-contrato",
        title: "Revisão de contrato",
        description:
          "Análise de contratos antes ou depois da assinatura, identificação de riscos e orientação.",
        examples: [
          "Contrato de serviço",
          "Compra e venda",
          "Descumprimento contratual",
        ],
        icon: "📝",
        accent: "text-blue-700",
        softBackground: "bg-blue-50",
        border: "border-blue-200",
      },
      {
        id: "imoveis-locacao",
        title: "Imóveis e locação",
        description:
          "Questões envolvendo aluguel, compra, venda, posse, condomínio e documentação imobiliária.",
        examples: [
          "Contrato de aluguel",
          "Compra e venda",
          "Problemas com imóvel",
        ],
        icon: "🏠",
        accent: "text-teal-700",
        softBackground: "bg-teal-50",
        border: "border-teal-200",
      },
      {
        id: "familia",
        title: "Família",
        description:
          "Orientação sobre divórcio, guarda, pensão, união, reconhecimento e outros assuntos familiares.",
        examples: [
          "Divórcio",
          "Guarda e pensão",
          "União estável",
        ],
        icon: "👨‍👩‍👧",
        accent: "text-rose-700",
        softBackground: "bg-rose-50",
        border: "border-rose-200",
      },
      {
        id: "inventario-sucessao",
        title: "Inventário e sucessão",
        description:
          "Atendimento relacionado à divisão de bens, herança, inventário e planejamento sucessório.",
        examples: [
          "Inventário",
          "Herança",
          "Planejamento sucessório",
        ],
        icon: "📚",
        accent: "text-purple-700",
        softBackground: "bg-purple-50",
        border: "border-purple-200",
      },
    ],
  },
  {
    title: "Direitos do dia a dia",
    description:
      "Problemas comuns envolvendo compras, serviços, bancos, trânsito e relações de consumo.",
    services: [
      {
        id: "direito-consumidor",
        title: "Compras e serviços",
        description:
          "Problemas com produtos, serviços, cancelamentos, cobranças e atendimento ao consumidor.",
        examples: [
          "Produto com defeito",
          "Serviço não prestado",
          "Cancelamento e reembolso",
        ],
        icon: "🛒",
        accent: "text-red-700",
        softBackground: "bg-red-50",
        border: "border-red-200",
      },
      {
        id: "bancos-cobrancas",
        title: "Bancos e cobranças",
        description:
          "Atendimento para cobranças indevidas, empréstimos, cartões, fraudes e problemas bancários.",
        examples: [
          "Cobrança indevida",
          "Fraude bancária",
          "Empréstimos e cartões",
        ],
        icon: "🏦",
        accent: "text-sky-700",
        softBackground: "bg-sky-50",
        border: "border-sky-200",
      },
      {
        id: "transito",
        title: "Trânsito",
        description:
          "Orientação sobre multas, acidentes, documentação, habilitação e responsabilidades.",
        examples: [
          "Multas",
          "Acidentes",
          "CNH e documentação",
        ],
        icon: "🚗",
        accent: "text-yellow-700",
        softBackground: "bg-yellow-50",
        border: "border-yellow-200",
      },
      {
        id: "dividas-negociacao",
        title: "Dívidas e negociação",
        description:
          "Ajuda para compreender dívidas, cobranças, acordos e possibilidades de negociação.",
        examples: [
          "Negociação",
          "Protesto",
          "Cobranças abusivas",
        ],
        icon: "📊",
        accent: "text-fuchsia-700",
        softBackground: "bg-fuchsia-50",
        border: "border-fuchsia-200",
      },
    ],
  },
  {
    title: "Proteção e orientação",
    description:
      "Serviços preventivos e especializados para proteger pessoas, empresas, informações e projetos.",
    services: [
      {
        id: "lgpd-protecao-dados",
        title: "LGPD e proteção de dados",
        description:
          "Orientação sobre privacidade, uso de dados pessoais, documentos e adequação à LGPD.",
        examples: [
          "Política de privacidade",
          "Uso de dados",
          "Adequação empresarial",
        ],
        icon: "🔐",
        accent: "text-blue-700",
        softBackground: "bg-blue-50",
        border: "border-blue-200",
      },
      {
        id: "registro-marca",
        title: "Marca e propriedade intelectual",
        description:
          "Proteção, registro e orientação sobre marcas, nomes, conteúdos e propriedade intelectual.",
        examples: [
          "Registro de marca",
          "Uso indevido",
          "Proteção de conteúdo",
        ],
        icon: "®️",
        accent: "text-violet-700",
        softBackground: "bg-violet-50",
        border: "border-violet-200",
      },
      {
        id: "consultoria-preventiva",
        title: "Consultoria preventiva",
        description:
          "Análise jurídica para prevenir riscos e orientar decisões pessoais ou empresariais.",
        examples: [
          "Análise de risco",
          "Orientação jurídica",
          "Prevenção de conflitos",
        ],
        icon: "💡",
        accent: "text-amber-700",
        softBackground: "bg-amber-50",
        border: "border-amber-200",
      },
      {
        id: "outros",
        title: "Outros assuntos",
        description:
          "Não encontrou exatamente o que precisa? Conte sua situação e o escritório fará o direcionamento.",
        examples: [
          "Análise inicial",
          "Dúvidas diversas",
          "Direcionamento jurídico",
        ],
        icon: "💬",
        accent: "text-slate-700",
        softBackground: "bg-slate-50",
        border: "border-slate-200",
      },
    ],
  },
];

export default function ClientServicesPage() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="overflow-hidden rounded-[2rem] border border-[#D8D2C7] bg-[#0B1D2D] shadow-xl shadow-[#0B1D2D]/10">
        <div className="grid xl:grid-cols-[1.4fr_0.6fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#C89B4A]">
              Central de serviços
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Como podemos ajudar você?
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#B8C2CC]">
              Escolha abaixo o assunto que mais se aproxima da sua necessidade.
              As opções atendem pessoas, profissionais e empresas. Você não
              precisa conhecer o nome jurídico do problema.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/client/cases/new"
                className="inline-flex items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
              >
                Abrir atendimento geral
              </Link>

              <Link
                href="/dashboard/client/cases"
                className="inline-flex items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#132D44] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#C89B4A] hover:bg-[#1A3A55]"
              >
                Acompanhar atendimentos
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#081827] p-7 md:p-8 xl:border-l xl:border-t-0">
            <div className="rounded-3xl border border-[#C89B4A]/30 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B4A]">
                Não sabe qual escolher?
              </p>

              <p className="mt-3 text-sm leading-6 text-[#D8DEE5]">
                Escolha “Outros assuntos” e explique sua situação. O escritório
                fará a análise e encaminhará o atendimento corretamente.
              </p>

              <Link
                href="/dashboard/client/cases/new?service=outros"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-[#C89B4A]/40 bg-[#0B1D2D] px-4 py-3 text-sm font-bold text-white transition hover:border-[#C89B4A]"
              >
                Conte o que aconteceu
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#0B1D2D]">
            Atendimento simples
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5B6472]">
            Escolha o assunto e explique sua necessidade com suas próprias
            palavras.
          </p>
        </div>

        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#0B1D2D]">
            Envio de documentos
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5B6472]">
            Depois de abrir o atendimento, você poderá enviar arquivos e
            comprovantes.
          </p>
        </div>

        <div className="rounded-3xl border border-[#D8D2C7] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#0B1D2D]">
            Acompanhamento online
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5B6472]">
            Acompanhe mensagens, documentos e atualizações pelo próprio portal.
          </p>
        </div>
      </section>

      {serviceGroups.map((group) => (
        <section
          key={group.title}
          className="overflow-hidden rounded-[1.75rem] border border-[#D8D2C7] bg-white shadow-sm"
        >
          <div className="border-b border-[#ECE7DD] bg-[#F8F6F1] p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B4A]">
              Serviços
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#0B1D2D]">
              {group.title}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5B6472]">
              {group.description}
            </p>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3 md:p-6">
            {group.services.map((service) => (
              <article
                key={service.id}
                className={`flex h-full flex-col rounded-3xl border ${service.border} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${service.softBackground} text-2xl`}
                >
                  <span aria-hidden="true">{service.icon}</span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#0B1D2D]">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                  {service.description}
                </p>

                <ul className="mt-4 space-y-2">
                  {service.examples.map((example) => (
                    <li
                      key={example}
                      className="flex items-start gap-2 text-sm text-[#5B6472]"
                    >
                      <span
                        className={`mt-0.5 font-bold ${service.accent}`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Link
                    href={`/dashboard/client/cases/new?service=${service.id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#0B1D2D] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#132D44]"
                  >
                    Solicitar atendimento
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-[1.75rem] border border-[#E7D7B5] bg-[#FFF8E8] p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E762D]">
              Atendimento personalizado
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#0B1D2D]">
              Ainda está com dúvida?
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7A5B24]">
              Não tem problema. Abra um atendimento geral e conte com detalhes
              o que aconteceu. O escritório fará o direcionamento.
            </p>
          </div>

          <Link
            href="/dashboard/client/cases/new?service=outros"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#C89B4A] px-5 py-3 text-sm font-bold text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
          >
            Falar com o escritório
          </Link>
        </div>
      </section>
    </section>
  );
}