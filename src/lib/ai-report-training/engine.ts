import { completeOpenAiChat } from "@/lib/ai/openai-completion";
import type { AiReportTrainingSample } from "@/lib/ai-report-training/types";

export type ExtractedWritingPattern = {
  patternSummary: string;
  styleGuidelines: string;
  sectionOutline: string;
};

function extractHeadingsFromSamples(samples: AiReportTrainingSample[]) {
  const headings = new Set<string>();

  for (const sample of samples) {
    const matches = sample.bodyText.match(/^#{1,3}\s+.+$|^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^\n]{3,60}$/gm);
    (matches ?? []).forEach((match) => {
      headings.add(match.replace(/^#+\s*/, "").trim());
    });
  }

  return Array.from(headings).slice(0, 12);
}

function buildHeuristicPattern(
  samples: AiReportTrainingSample[]
): ExtractedWritingPattern {
  const headings = extractHeadingsFromSamples(samples);
  const sectionOutline =
    headings.length > 0
      ? headings
      : [
          "Identificação do paciente",
          "Histórico e demanda",
          "Procedimentos",
          "Resultados",
          "Conclusão e recomendações",
        ];

  return {
    patternSummary: `Padrão derivado de ${samples.length} relatório(s) manuais da área. Estrutura com ${sectionOutline.length} seções recorrentes e linguagem clínica formal.`,
    styleGuidelines:
      "Manter objetividade, registrar evolução com evidências observáveis e finalizar com conduta clara para a família e equipe.",
    sectionOutline: sectionOutline.join("\n"),
  };
}

export async function trainWritingPatternFromSamples(
  contextLabel: string,
  samples: AiReportTrainingSample[]
): Promise<ExtractedWritingPattern & { mockMode: boolean }> {
  const combinedReports = samples
    .map(
      (sample, index) =>
        `### Relatório ${index + 1}: ${sample.title}\n${sample.bodyText}`
    )
    .join("\n\n---\n\n");

  const { content, mockMode } = await completeOpenAiChat({
    temperature: 0.2,
    maxTokens: 2048,
    messages: [
      {
        role: "system",
        content:
          "Você é especialista em documentação clínica. Analise relatórios de referência e extraia o padrão de escrita para replicação futura. Responda APENAS com JSON válido.",
      },
      {
        role: "user",
        content: [
          `Contexto: ${contextLabel}`,
          "",
          "Analise os relatórios abaixo e extraia o PADRÃO DE ESCRITA compartilhado.",
          'Retorne JSON: {"patternSummary":"...","styleGuidelines":"...","sectionOutline":"seção 1\\nseção 2\\n..."}',
          "",
          combinedReports,
        ].join("\n"),
      },
    ],
  });

  if (mockMode) {
    const heuristic = buildHeuristicPattern(samples);
    return { ...heuristic, mockMode: true };
  }

  try {
    const parsed = JSON.parse(content) as Partial<ExtractedWritingPattern>;
    return {
      patternSummary: parsed.patternSummary?.trim() || buildHeuristicPattern(samples).patternSummary,
      styleGuidelines:
        parsed.styleGuidelines?.trim() || buildHeuristicPattern(samples).styleGuidelines,
      sectionOutline:
        parsed.sectionOutline?.trim() || buildHeuristicPattern(samples).sectionOutline,
      mockMode: false,
    };
  } catch {
    return { ...buildHeuristicPattern(samples), mockMode: false };
  }
}

export async function generateClinicalReportDraft(input: {
  contextLabel: string;
  memory: ExtractedWritingPattern;
  patientName: string;
  patientAge?: string;
  evaluationPeriod: string;
  clinicalDemand: string;
  sessionSummary?: string;
  therapeuticGoals?: string;
  additionalNotes?: string;
}): Promise<{ title: string; bodyHtml: string; bodyText: string; mockMode: boolean }> {
  const patientContext = [
    `Paciente: ${input.patientName}`,
    input.patientAge ? `Idade: ${input.patientAge}` : null,
    `Período: ${input.evaluationPeriod}`,
    `Demanda: ${input.clinicalDemand}`,
    input.sessionSummary ? `Resumo das sessões: ${input.sessionSummary}` : null,
    input.therapeuticGoals ? `Objetivos: ${input.therapeuticGoals}` : null,
    input.additionalNotes ? `Observações: ${input.additionalNotes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { content, mockMode } = await completeOpenAiChat({
    temperature: 0.4,
    maxTokens: 4096,
    messages: [
      {
        role: "system",
        content: [
          `Você redige documentos clínicos do contexto "${input.contextLabel}".`,
          "Siga rigorosamente o padrão de escrita treinado:",
          input.memory.patternSummary,
          "",
          "Diretrizes de estilo:",
          input.memory.styleGuidelines,
          "",
          "Estrutura obrigatória (seções):",
          input.memory.sectionOutline,
          "",
          "Responda em HTML semântico (<h2>, <p>, <ul>) pronto para o prontuário.",
        ].join("\n"),
      },
      {
        role: "user",
        content: `Gere o relatório clínico completo com base nestes dados:\n\n${patientContext}`,
      },
    ],
  });

  const bodyHtml = content.startsWith("<") ? content : `<p>${content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
  const bodyText = bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const title = `${input.contextLabel} — ${input.patientName} — ${input.evaluationPeriod}`;

  return { title, bodyHtml, bodyText, mockMode };
}
