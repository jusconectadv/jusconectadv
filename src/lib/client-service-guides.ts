export type ClientServiceGuide = {
  id: string;
  title: string;
  category: string;
  summary: string;
  situationPlaceholder: string;
  objectivePlaceholder: string;
  examples: readonly string[];
};

const guides: readonly ClientServiceGuide[] = [
  {
    id: "problema-trabalhista",
    title: "Problema trabalhista",
    category: "Trabalho e previdência",
    summary:
      "Conte situações envolvendo emprego, demissão, salários, férias, horas extras ou outros direitos.",
    situationPlaceholder:
      "Explique onde trabalhou, sua função, quando começou, o que aconteceu e se ainda trabalha no local.",
    objectivePlaceholder:
      "Ex: Quero entender meus direitos, revisar minha rescisão ou cobrar valores não pagos.",
    examples: [
      "Demissão ou rescisão",
      "Salários e benefícios",
      "Horas extras e férias",
    ],
  },
  {
    id: "previdencia-beneficios",
    title: "Previdência e benefícios",
    category: "Trabalho e previdência",
    summary:
      "Descreva dúvidas ou problemas relacionados ao INSS, aposentadoria, auxílio ou benefício.",
    situationPlaceholder:
      "Informe o benefício pretendido ou negado, datas, protocolos e o que foi informado pelo INSS.",
    objectivePlaceholder:
      "Ex: Quero solicitar um benefício, revisar a decisão ou entender se tenho direito.",
    examples: ["Aposentadoria", "Auxílios", "Benefício negado"],
  },
  {
    id: "relacao-com-funcionarios",
    title: "Relação com funcionários",
    category: "Empresas e negócios",
    summary:
      "Atendimento para empresas sobre contratação, desligamento, rotina trabalhista e prevenção.",
    situationPlaceholder:
      "Explique a situação do funcionário, cargo, datas, documentos existentes e o problema identificado.",
    objectivePlaceholder:
      "Ex: Quero realizar um desligamento corretamente ou prevenir riscos trabalhistas.",
    examples: ["Contratação", "Desligamento", "Prevenção trabalhista"],
  },
  {
    id: "abertura-regularizacao-empresa",
    title: "Abertura e regularização",
    category: "Empresas e negócios",
    summary:
      "Informe se deseja abrir, alterar ou regularizar uma empresa, negócio ou atividade profissional.",
    situationPlaceholder:
      "Conte qual atividade exerce ou deseja exercer, cidade, situação atual e se já possui CNPJ ou MEI.",
    objectivePlaceholder:
      "Ex: Quero abrir um MEI, regularizar pendências ou alterar dados da empresa.",
    examples: ["Abertura de empresa", "MEI", "Alterações cadastrais"],
  },
  {
    id: "contratos-empresariais",
    title: "Contratos empresariais",
    category: "Empresas e negócios",
    summary:
      "Utilize para criação, revisão ou análise de contratos comerciais.",
    situationPlaceholder:
      "Informe quem participa do contrato, o serviço ou negócio envolvido, valores, prazos e riscos percebidos.",
    objectivePlaceholder:
      "Ex: Quero criar um contrato ou revisar um documento antes de assinar.",
    examples: ["Prestação de serviços", "Fornecedor", "Parceria"],
  },
  {
    id: "cobranca-inadimplencia",
    title: "Cobrança e inadimplência",
    category: "Empresas e negócios",
    summary:
      "Descreva valores não recebidos, negociações realizadas e documentos que comprovem a dívida.",
    situationPlaceholder:
      "Informe quem deve, valor aproximado, vencimento, motivo da dívida e tentativas de cobrança.",
    objectivePlaceholder:
      "Ex: Quero cobrar formalmente, negociar ou iniciar as medidas necessárias.",
    examples: ["Cliente devedor", "Cobrança", "Negociação"],
  },
  {
    id: "socios-empresa",
    title: "Sócios e organização empresarial",
    category: "Empresas e negócios",
    summary:
      "Atendimento para conflitos, entrada ou saída de sócios e responsabilidades empresariais.",
    situationPlaceholder:
      "Explique quem são os sócios, como a empresa está organizada e qual conflito ou alteração precisa ser resolvido.",
    objectivePlaceholder:
      "Ex: Quero retirar um sócio, reorganizar a empresa ou resolver um conflito.",
    examples: ["Entrada ou saída de sócio", "Conflito", "Responsabilidades"],
  },
  {
    id: "licitacoes",
    title: "Licitações",
    category: "Empresas e negócios",
    summary:
      "Utilize para análise de edital, documentação, habilitação, recursos ou impugnações.",
    situationPlaceholder:
      "Informe o órgão, número da licitação, objeto, fase atual e prazo mais próximo.",
    objectivePlaceholder:
      "Ex: Quero revisar o edital, preparar documentação ou apresentar recurso.",
    examples: ["Edital", "Habilitação", "Recurso"],
  },
  {
    id: "tributario",
    title: "Questões tributárias",
    category: "Empresas e negócios",
    summary:
      "Descreva problemas relacionados a impostos, débitos, cobranças ou regularização fiscal.",
    situationPlaceholder:
      "Informe o imposto ou débito, órgão responsável, valores aproximados, datas e notificações recebidas.",
    objectivePlaceholder:
      "Ex: Quero regularizar, parcelar ou analisar uma cobrança tributária.",
    examples: ["Débitos fiscais", "Parcelamentos", "Regularização"],
  },
  {
    id: "revisao-contrato",
    title: "Revisão de contrato",
    category: "Contratos e patrimônio",
    summary:
      "Envie informações sobre um contrato que deseja criar, revisar ou questionar.",
    situationPlaceholder:
      "Explique o tipo de contrato, partes envolvidas, valores, prazos e qual cláusula ou situação gera dúvida.",
    objectivePlaceholder:
      "Ex: Quero saber se posso assinar, cancelar ou exigir o cumprimento.",
    examples: ["Compra e venda", "Serviço", "Descumprimento"],
  },
  {
    id: "imoveis-locacao",
    title: "Imóveis e locação",
    category: "Contratos e patrimônio",
    summary:
      "Utilize para aluguel, compra, venda, posse, condomínio ou documentação imobiliária.",
    situationPlaceholder:
      "Informe o imóvel, cidade, relação das pessoas envolvidas, contrato existente e o que aconteceu.",
    objectivePlaceholder:
      "Ex: Quero revisar o aluguel, resolver uma cobrança ou regularizar o imóvel.",
    examples: ["Aluguel", "Compra e venda", "Condomínio"],
  },
  {
    id: "familia",
    title: "Família",
    category: "Família e patrimônio",
    summary:
      "Descreva situações envolvendo divórcio, guarda, pensão, união estável ou questões familiares.",
    situationPlaceholder:
      "Conte quem está envolvido, existência de filhos, acordos atuais, datas e situação mais urgente.",
    objectivePlaceholder:
      "Ex: Quero iniciar um divórcio, regularizar guarda ou solicitar pensão.",
    examples: ["Divórcio", "Guarda", "Pensão"],
  },
  {
    id: "inventario-sucessao",
    title: "Inventário e sucessão",
    category: "Família e patrimônio",
    summary:
      "Utilize para inventário, herança, divisão de bens ou planejamento sucessório.",
    situationPlaceholder:
      "Informe quem faleceu, data, familiares envolvidos, bens conhecidos e existência de testamento.",
    objectivePlaceholder:
      "Ex: Quero iniciar o inventário ou entender como será a divisão dos bens.",
    examples: ["Inventário", "Herança", "Divisão de bens"],
  },
  {
    id: "direito-consumidor",
    title: "Compras e serviços",
    category: "Direitos do dia a dia",
    summary:
      "Descreva problemas com produtos, serviços, cancelamentos, cobranças ou reembolsos.",
    situationPlaceholder:
      "Informe empresa, produto ou serviço, data da compra, valor, problema e tentativas de solução.",
    objectivePlaceholder:
      "Ex: Quero cancelar, receber reembolso, trocar o produto ou ser indenizado.",
    examples: ["Produto com defeito", "Serviço não prestado", "Reembolso"],
  },
  {
    id: "bancos-cobrancas",
    title: "Bancos e cobranças",
    category: "Direitos do dia a dia",
    summary:
      "Utilize para fraude, cobrança indevida, empréstimo, cartão ou outro problema bancário.",
    situationPlaceholder:
      "Informe banco, valor, data, operação questionada, protocolos e providências já tomadas.",
    objectivePlaceholder:
      "Ex: Quero cancelar a cobrança, recuperar um valor ou corrigir uma dívida.",
    examples: ["Fraude", "Cartão", "Cobrança indevida"],
  },
  {
    id: "transito",
    title: "Trânsito",
    category: "Direitos do dia a dia",
    summary:
      "Descreva situações envolvendo multas, acidentes, CNH ou documentação de veículos.",
    situationPlaceholder:
      "Informe data, local, veículo, pessoas envolvidas, multa ou ocorrência e documentos existentes.",
    objectivePlaceholder:
      "Ex: Quero recorrer de uma multa ou resolver uma responsabilidade por acidente.",
    examples: ["Multas", "Acidentes", "CNH"],
  },
  {
    id: "dividas-negociacao",
    title: "Dívidas e negociação",
    category: "Direitos do dia a dia",
    summary:
      "Explique a dívida, cobrança, protesto ou negociação que precisa analisar.",
    situationPlaceholder:
      "Informe credor, valor, origem da dívida, vencimento, cobranças recebidas e acordos já tentados.",
    objectivePlaceholder:
      "Ex: Quero negociar, contestar ou retirar uma cobrança indevida.",
    examples: ["Negociação", "Protesto", "Cobrança abusiva"],
  },
  {
    id: "lgpd-protecao-dados",
    title: "LGPD e proteção de dados",
    category: "Proteção e orientação",
    summary:
      "Utilize para privacidade, uso de dados pessoais, políticas e adequação à LGPD.",
    situationPlaceholder:
      "Explique quais dados são utilizados, por quem, para qual finalidade e qual risco ou dúvida existe.",
    objectivePlaceholder:
      "Ex: Quero adequar a empresa ou resolver o uso indevido dos meus dados.",
    examples: ["Privacidade", "Uso de dados", "Adequação"],
  },
  {
    id: "registro-marca",
    title: "Marca e propriedade intelectual",
    category: "Proteção e orientação",
    summary:
      "Informe se deseja registrar, proteger ou questionar o uso de uma marca ou conteúdo.",
    situationPlaceholder:
      "Informe o nome da marca, atividade, tempo de uso, existência de logotipo e eventual uso por terceiros.",
    objectivePlaceholder:
      "Ex: Quero registrar minha marca ou impedir o uso indevido.",
    examples: ["Registro", "Uso indevido", "Proteção de conteúdo"],
  },
  {
    id: "consultoria-preventiva",
    title: "Consultoria preventiva",
    category: "Proteção e orientação",
    summary:
      "Use para analisar riscos e receber orientação antes de tomar uma decisão.",
    situationPlaceholder:
      "Explique a decisão, negociação, projeto ou situação que deseja avaliar preventivamente.",
    objectivePlaceholder:
      "Ex: Quero entender os riscos e escolher a forma mais segura de agir.",
    examples: ["Análise de risco", "Orientação", "Prevenção"],
  },
  {
    id: "outros",
    title: "Outros assuntos",
    category: "Atendimento geral",
    summary:
      "Não encontrou uma opção exata? Conte sua situação com suas próprias palavras.",
    situationPlaceholder:
      "Explique com detalhes o que aconteceu, quando começou, quem está envolvido e quais documentos possui.",
    objectivePlaceholder:
      "Conte o que espera que o escritório analise ou resolva.",
    examples: ["Dúvidas gerais", "Análise inicial", "Direcionamento"],
  },
];

export function getClientServiceGuide(
  serviceId: string | undefined,
): ClientServiceGuide {
  return (
    guides.find((guide) => guide.id === serviceId) ??
    guides.find((guide) => guide.id === "outros")!
  );
}