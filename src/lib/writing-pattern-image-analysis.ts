export const WRITING_PATTERN_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

export const WRITING_PATTERN_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const WRITING_PATTERN_MAX_IMAGES = 5;
export const WRITING_PATTERN_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type WritingPatternImageInput = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

export type WritingPatternImageExtraction = {
  fileName: string;
  extractedText: string;
};

export function isWritingPatternImageMimeType(
  mimeType: string
): mimeType is (typeof WRITING_PATTERN_IMAGE_MIME_TYPES)[number] {
  return WRITING_PATTERN_IMAGE_MIME_TYPES.includes(
    mimeType as (typeof WRITING_PATTERN_IMAGE_MIME_TYPES)[number]
  );
}

export function validateWritingPatternImages(
  images: WritingPatternImageInput[]
): string | null {
  if (images.length > WRITING_PATTERN_MAX_IMAGES) {
    return `Envie no máximo ${WRITING_PATTERN_MAX_IMAGES} imagens por análise.`;
  }

  for (const image of images) {
    if (!isWritingPatternImageMimeType(image.mimeType)) {
      return `Formato não suportado em "${image.name}". Use JPG, PNG, WEBP ou GIF.`;
    }

    const base64Payload = image.dataUrl.split(",")[1] ?? "";
    const approximateBytes = Math.ceil((base64Payload.length * 3) / 4);

    if (approximateBytes > WRITING_PATTERN_MAX_IMAGE_BYTES) {
      return `A imagem "${image.name}" excede o limite de 5 MB.`;
    }
  }

  return null;
}

function buildMockExtractedText(fileName: string) {
  return [
    `Documento identificado em "${fileName}".`,
    "Seções visíveis: identificação do paciente, descrição da demanda, evolução clínica, conclusão e recomendações.",
    "Assinatura profissional e registro de conselho detectados no rodapé do documento.",
  ].join(" ");
}

async function extractTextWithOpenAiVision(
  image: WritingPatternImageInput,
  apiKey: string,
  model: string
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraia integralmente o texto legível deste documento clínico em português. Preserve títulos de seções, nomes, datas e conclusões. Retorne apenas o texto extraído.",
            },
            {
              type: "image_url",
              image_url: { url: image.dataUrl },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha na leitura da imagem "${image.name}".`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const extractedText = payload.choices?.[0]?.message?.content?.trim();

  if (!extractedText) {
    throw new Error(`Não foi possível extrair texto de "${image.name}".`);
  }

  return extractedText;
}

export async function extractTextFromWritingPatternImages(input: {
  images: WritingPatternImageInput[];
  mockMode: boolean;
  openAiApiKey?: string | null;
  openAiModel?: string;
}): Promise<WritingPatternImageExtraction[]> {
  if (input.images.length === 0) {
    return [];
  }

  if (input.mockMode || !input.openAiApiKey) {
    return input.images.map((image) => ({
      fileName: image.name,
      extractedText: buildMockExtractedText(image.name),
    }));
  }

  const extractions: WritingPatternImageExtraction[] = [];

  for (const image of input.images) {
    const extractedText = await extractTextWithOpenAiVision(
      image,
      input.openAiApiKey,
      input.openAiModel ?? "gpt-4.1-mini"
    );

    extractions.push({
      fileName: image.name,
      extractedText,
    });
  }

  return extractions;
}
