import {
  getOpenAiApiKey,
  getOpenAiDefaultModel,
  isAiMockMode,
} from "@/lib/ai/env";

export type OpenAiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAiCompletionOptions = {
  messages: OpenAiChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

export async function completeOpenAiChat(
  options: OpenAiCompletionOptions
): Promise<{ content: string; mockMode: boolean }> {
  const mockMode = isAiMockMode();
  const apiKey = getOpenAiApiKey();

  if (mockMode || !apiKey) {
    const userMessage =
      options.messages.find((message) => message.role === "user")?.content ??
      "";

    return {
      mockMode: true,
      content: buildMockCompletion(userMessage),
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAiDefaultModel(),
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4096,
      messages: options.messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenAI retornou ${response.status}: ${errorBody.slice(0, 300)}`
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenAI não retornou conteúdo na resposta.");
  }

  return { content, mockMode: false };
}

function buildMockCompletion(userMessage: string) {
  if (userMessage.includes("PADRÃO DE ESCRITA")) {
    return JSON.stringify({
      patternSummary:
        "Relatórios formais em terceira pessoa, linguagem técnica acessível, estrutura com identificação, histórico, procedimentos, resultados e recomendações.",
      styleGuidelines:
        "Tom objetivo e respeitoso; parágrafos curtos; evitar jargão excessivo; conclusão com encaminhamentos práticos.",
      sectionOutline: [
        "Identificação do paciente",
        "Demanda e objetivos",
        "Procedimentos realizados",
        "Observações clínicas",
        "Resultados e evolução",
        "Conclusão e recomendações",
        "Assinatura profissional",
      ],
    });
  }

  return [
    "<h2>Identificação</h2>",
    "<p>Paciente atendido no período informado, conforme dados fornecidos.</p>",
    "<h2>Demanda clínica</h2>",
    "<p>A demanda foi descrita conforme o contexto enviado pelo profissional.</p>",
    "<h2>Procedimentos e observações</h2>",
    "<p>Sessões conduzidas com abordagem alinhada ao padrão da área clínica treinada (modo demonstração — configure OPENAI_API_KEY para geração real).</p>",
    "<h2>Conclusão</h2>",
    "<p>Recomenda-se manutenção do acompanhamento e revisão periódica dos objetivos terapêuticos.</p>",
  ].join("\n");
}
