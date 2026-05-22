import OpenAI from "openai";
import type { Database } from "@/src/types/supabase";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

type AnalyzeCaseInput = {
  legalCase: CaseRow;
  client: ClientRow;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeCase({
  legalCase,
  client,
}: AnalyzeCaseInput): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const response = await openai.responses.create({
    model: "gpt-5.4-mini",
    instructions: `
Você é um assistente jurídico interno para advogados no Brasil.
Sua função é analisar casos de forma técnica, organizada e prudente.

Regras:
- Não prometa resultado.
- Não diga que há garantia de êxito.
- Não substitua a análise do advogado.
- Organize a resposta em tópicos.
- Use linguagem profissional.
- Sempre indique pontos de atenção, documentos úteis e próximos passos.
`,
    input: `
DADOS DO CLIENTE:
Nome: ${client.name}
Tipo: ${client.type}
Documento: ${client.document ?? "Não informado"}
Email: ${client.email ?? "Não informado"}
Telefone: ${client.phone ?? "Não informado"}

DADOS DO CASO:
Título: ${legalCase.title}
Status: ${legalCase.status}
Prioridade: ${legalCase.priority}
Descrição:
${legalCase.description ?? "Não informada"}

Gere uma análise jurídica inicial com:
1. Resumo objetivo
2. Possível área jurídica
3. Pontos de atenção
4. Documentos recomendados
5. Riscos percebidos
6. Próximos passos sugeridos ao advogado
`,
  });

  return response.output_text;
}