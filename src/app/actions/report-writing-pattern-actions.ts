"use server";

import { listDocumentTemplatesAction } from "@/app/actions/document-template-actions";
import { requirePermission } from "@/lib/auth-guard";
import {
  getOpenAiApiKey,
  getOpenAiDefaultModel,
  isAiMockMode,
} from "@/lib/ai/env";
import { PERMISSIONS } from "@/lib/rbac";
import {
  extractTextFromWritingPatternImages,
  validateWritingPatternImages,
  type WritingPatternImageExtraction,
  type WritingPatternImageInput,
} from "@/lib/writing-pattern-image-analysis";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type WritingPatternModel = {
  id: string;
  name: string;
  category: string;
  sectionCount: number;
};

export type WritingPatternCheck = {
  modelName: string;
  score: number;
  status: "conforme" | "parcial" | "divergente";
  observations: string[];
};

export type WritingPatternVerificationResult = {
  overallScore: number;
  summary: string;
  checks: WritingPatternCheck[];
  modelsUsed: WritingPatternModel[];
  mockMode: boolean;
  inputSources: Array<"text" | "image">;
  imageExtractions: WritingPatternImageExtraction[];
  analyzedTextPreview: string;
};

const WRITING_PATTERN_MODEL_LIMIT = 5;
const MIN_TEXT_LENGTH = 80;

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSections(bodyHtml: string) {
  const headings = bodyHtml.match(/<h[23][^>]*>.*?<\/h[23]>/gi) ?? [];

  return headings.map((heading) =>
    heading.replace(/<[^>]+>/g, "").trim()
  );
}

function scoreTextAgainstModel(
  text: string,
  modelName: string,
  sections: string[]
): WritingPatternCheck {
  const normalizedText = text.toLowerCase();
  const observations: string[] = [];
  let matchedSections = 0;

  sections.forEach((section) => {
    const keywords = section
      .toLowerCase()
      .split(/[^a-zà-ú0-9]+/i)
      .filter((word) => word.length > 3);

    const hasMatch = keywords.some((keyword) =>
      normalizedText.includes(keyword)
    );

    if (hasMatch) {
      matchedSections += 1;
    } else if (keywords.length > 0) {
      observations.push(
        `Considere incluir conteúdo relacionado a "${section}".`
      );
    }
  });

  const sectionScore =
    sections.length > 0
      ? Math.round((matchedSections / sections.length) * 100)
      : 50;

  const hasIdentification =
    /paciente|aprendiz|identifica/i.test(text) ||
    /nome|data de nascimento|idade/i.test(text);
  const hasConclusion =
    /conclus|recomenda|conduta|encaminhamento/i.test(text);
  const hasProfessionalSignature =
    /crp|crfa|profissional|psicólog|psicopedagog/i.test(text);

  let bonus = 0;
  if (hasIdentification) bonus += 5;
  if (hasConclusion) bonus += 5;
  if (hasProfessionalSignature) bonus += 5;

  const score = Math.min(100, sectionScore + bonus);

  let status: WritingPatternCheck["status"] = "divergente";
  if (score >= 75) status = "conforme";
  else if (score >= 50) status = "parcial";

  if (score >= 75) {
    observations.unshift(
      `Estrutura compatível com o modelo "${modelName}".`
    );
  } else if (observations.length === 0) {
    observations.push(
      `Revise a organização do texto conforme o modelo "${modelName}".`
    );
  }

  return {
    modelName,
    score,
    status,
    observations: observations.slice(0, 3),
  };
}

function buildAnalyzedTextPreview(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= 280) {
    return normalized;
  }

  return `${normalized.slice(0, 280)}...`;
}

function buildSummary(input: {
  overallScore: number;
  conformeCount: number;
  totalChecks: number;
  inputSources: Array<"text" | "image">;
  imageCount: number;
  mockMode: boolean;
}) {
  const sourceLabel =
    input.inputSources.length === 2
      ? "texto e imagens enviadas"
      : input.inputSources[0] === "image"
        ? `${input.imageCount} imagem(ns) analisada(s)`
        : "texto informado";

  const baseSummary =
    input.overallScore >= 75
      ? `A análise de ${sourceLabel} apresenta boa aderência ao padrão clínico (${input.conformeCount} de ${input.totalChecks} modelos conformes).`
      : input.overallScore >= 50
        ? `A análise de ${sourceLabel} está parcialmente alinhada aos modelos. Revise as seções indicadas abaixo.`
        : `A análise de ${sourceLabel} diverge dos modelos de referência. Reestruture conforme as observações.`;

  if (input.mockMode && input.inputSources.includes("image")) {
    return `${baseSummary} Em modo demonstração, o texto das imagens é simulado; com API configurada, a IA usa visão computacional para OCR real.`;
  }

  return baseSummary;
}

export async function verifyWritingPatternAction(input: {
  text?: string;
  images?: WritingPatternImageInput[];
}): Promise<ActionResult<WritingPatternVerificationResult>> {
  await requirePermission(PERMISSIONS.REPORTS_VIEW);

  const text = input.text?.trim() ?? "";
  const images = input.images ?? [];
  const mockMode = isAiMockMode();

  if (!text && images.length === 0) {
    return {
      success: false,
      error: "Informe um texto ou envie ao menos uma imagem para análise.",
    };
  }

  const imageValidationError = validateWritingPatternImages(images);

  if (imageValidationError) {
    return { success: false, error: imageValidationError };
  }

  let imageExtractions: WritingPatternImageExtraction[] = [];

  if (images.length > 0) {
    try {
      imageExtractions = await extractTextFromWritingPatternImages({
        images,
        mockMode,
        openAiApiKey: getOpenAiApiKey(),
        openAiModel: getOpenAiDefaultModel(),
      });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível processar as imagens enviadas.",
      };
    }
  }

  const extractedImageText = imageExtractions
    .map((item) => item.extractedText)
    .join("\n\n");

  const combinedText = [text, extractedImageText]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  if (combinedText.length < MIN_TEXT_LENGTH) {
    return {
      success: false,
      error:
        images.length > 0
          ? "Não foi possível extrair texto suficiente das imagens. Envie fotos mais nítidas ou complemente com texto digitado."
          : `O texto deve ter pelo menos ${MIN_TEXT_LENGTH} caracteres para análise.`,
    };
  }

  const templatesResult = await listDocumentTemplatesAction({ activeOnly: true });

  if (!templatesResult.success || !templatesResult.data) {
    return {
      success: false,
      error: templatesResult.error ?? "Não foi possível carregar os modelos.",
    };
  }

  const referenceTemplates = templatesResult.data.templates
    .filter((template) =>
      ["relatorio", "parecer"].includes(template.category)
    )
    .slice(0, WRITING_PATTERN_MODEL_LIMIT);

  if (referenceTemplates.length === 0) {
    return {
      success: false,
      error: "Nenhum modelo de referência disponível para verificação.",
    };
  }

  const modelsUsed: WritingPatternModel[] = referenceTemplates.map(
    (template) => ({
      id: template.id,
      name: template.name,
      category: template.category,
      sectionCount: extractSections(template.body_html).length,
    })
  );

  const normalizedAnalysisText = stripHtml(combinedText);

  const checks = referenceTemplates.map((template) =>
    scoreTextAgainstModel(
      normalizedAnalysisText,
      template.name,
      extractSections(template.body_html)
    )
  );

  const overallScore = Math.round(
    checks.reduce((sum, check) => sum + check.score, 0) / checks.length
  );

  const conformeCount = checks.filter(
    (check) => check.status === "conforme"
  ).length;

  const inputSources: Array<"text" | "image"> = [];

  if (text) {
    inputSources.push("text");
  }

  if (images.length > 0) {
    inputSources.push("image");
  }

  return {
    success: true,
    data: {
      overallScore,
      summary: buildSummary({
        overallScore,
        conformeCount,
        totalChecks: checks.length,
        inputSources,
        imageCount: images.length,
        mockMode,
      }),
      checks,
      modelsUsed,
      mockMode,
      inputSources,
      imageExtractions,
      analyzedTextPreview: buildAnalyzedTextPreview(normalizedAnalysisText),
    },
  };
}
