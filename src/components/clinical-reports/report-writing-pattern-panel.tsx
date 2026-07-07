"use client";

import { useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import {
  verifyWritingPatternAction,
  type WritingPatternVerificationResult,
} from "@/app/actions/report-writing-pattern-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  WRITING_PATTERN_IMAGE_ACCEPT,
  WRITING_PATTERN_MAX_IMAGES,
  WRITING_PATTERN_MAX_IMAGE_BYTES,
  isWritingPatternImageMimeType,
  type WritingPatternImageInput,
} from "@/lib/writing-pattern-image-analysis";
import { cn } from "@/lib/utils";

const statusStyles = {
  conforme: "border-clinical-success/30 bg-clinical-success/10 text-clinical-success",
  parcial: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  divergente: "border-destructive/30 bg-destructive/10 text-destructive",
} as const;

const statusLabels = {
  conforme: "Conforme",
  parcial: "Parcial",
  divergente: "Divergente",
} as const;

type UploadedImage = WritingPatternImageInput & {
  previewUrl: string;
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function ResultPanel({ result }: { result: WritingPatternVerificationResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-2xl font-semibold text-foreground">
            {result.overallScore}%
          </p>
          <Badge variant="secondary">aderência geral</Badge>
          {result.inputSources.map((source) => (
            <Badge key={source} variant="outline">
              {source === "text" ? "Texto" : "Imagem"}
            </Badge>
          ))}
          {result.mockMode ? (
            <Badge variant="outline">IA em modo demonstração</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {result.summary}
        </p>
      </div>

      {result.imageExtractions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Texto extraído das imagens
          </p>
          <div className="space-y-2">
            {result.imageExtractions.map((extraction) => (
              <div
                key={extraction.fileName}
                className="rounded-xl border border-border/60 bg-muted/10 p-3"
              >
                <p className="text-xs font-medium text-foreground">
                  {extraction.fileName}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {extraction.extractedText}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border/60 bg-background p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Conteúdo analisado
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/85">
          {result.analyzedTextPreview}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Modelos de referência ({result.modelsUsed.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {result.modelsUsed.map((model) => (
            <Badge key={model.id} variant="outline" className="font-normal">
              {model.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {result.checks.map((check) => (
          <div
            key={check.modelName}
            className="rounded-xl border border-border/60 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{check.modelName}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{check.score}%</span>
                <Badge
                  variant="outline"
                  className={cn("text-[0.65rem]", statusStyles[check.status])}
                >
                  {statusLabels[check.status]}
                </Badge>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {check.observations.map((observation) => (
                <li
                  key={observation}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  {check.status === "conforme" ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-clinical-success" />
                  ) : (
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  )}
                  {observation}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportWritingPatternPanel() {
  const toast = useAppToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [result, setResult] = useState<WritingPatternVerificationResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit =
    text.trim().length >= 80 || images.length > 0;

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) {
      return;
    }

    const remainingSlots = WRITING_PATTERN_MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      toast.error({
        title: "Limite de imagens",
        description: `Envie no máximo ${WRITING_PATTERN_MAX_IMAGES} imagens por análise.`,
      });
      return;
    }

    const selectedFiles = Array.from(fileList).slice(0, remainingSlots);
    const nextImages: UploadedImage[] = [];

    for (const file of selectedFiles) {
      if (!isWritingPatternImageMimeType(file.type)) {
        toast.error({
          title: "Formato inválido",
          description: `"${file.name}" não é suportado. Use JPG, PNG, WEBP ou GIF.`,
        });
        continue;
      }

      if (file.size > WRITING_PATTERN_MAX_IMAGE_BYTES) {
        toast.error({
          title: "Arquivo grande demais",
          description: `"${file.name}" excede o limite de 5 MB.`,
        });
        continue;
      }

      try {
        const dataUrl = await fileToDataUrl(file);
        nextImages.push({
          name: file.name,
          mimeType: file.type,
          dataUrl,
          previewUrl: dataUrl,
        });
      } catch {
        toast.error({
          title: "Falha na leitura",
          description: `Não foi possível processar "${file.name}".`,
        });
      }
    }

    if (nextImages.length > 0) {
      setImages((current) => [...current, ...nextImages]);
      setResult(null);
    }
  }

  function handleRemoveImage(name: string) {
    setImages((current) => current.filter((image) => image.name !== name));
    setResult(null);
  }

  function handleVerify() {
    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await verifyWritingPatternAction({
        text,
        images: images.map(({ name, mimeType, dataUrl }) => ({
          name,
          mimeType,
          dataUrl,
        })),
      });

      if (!response.success) {
        const message =
          response.error ?? "Não foi possível verificar o padrão de escrita.";
        setError(message);
        toast.error({ title: "Verificação falhou", description: message });
        return;
      }

      if (response.data) {
        setResult(response.data);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden />
          Verificação de padrão de escrita
        </CardTitle>
        <CardDescription>
          Envie texto digitado, fotos ou imagens do relatório. A IA extrai o
          conteúdo visual, compara com até 5 modelos clínicos da biblioteca e
          indica a conformidade estrutural.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-writing-text">Texto do relatório</Label>
          <Textarea
            id="report-writing-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Cole ou digite o relatório. Você também pode enviar apenas fotos/imagens abaixo."
            className="min-h-36 resize-y"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-writing-images">Fotos ou imagens</Label>
          <input
            ref={fileInputRef}
            id="report-writing-images"
            type="file"
            accept={WRITING_PATTERN_IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => {
              void handleFilesSelected(event.target.files);
              event.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
            }}
            onDrop={(event) => {
              event.preventDefault();
              void handleFilesSelected(event.dataTransfer.files);
            }}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/10 px-4 py-8 text-center transition-colors hover:bg-muted/20"
          >
            <ImagePlus className="size-8 text-primary/80" aria-hidden />
            <span className="text-sm font-medium text-foreground">
              Clique ou arraste fotos/imagens do relatório
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG, WEBP ou GIF · até {WRITING_PATTERN_MAX_IMAGES} arquivos ·
              5 MB cada
            </span>
          </button>

          {images.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.name}
                  className="overflow-hidden rounded-xl border border-border/60 bg-card"
                >
                  <div className="relative aspect-[4/3] bg-muted/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.previewUrl}
                      alt={image.name}
                      className="size-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      className="absolute top-2 right-2 bg-background/90"
                      onClick={() => handleRemoveImage(image.name)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                  <p className="truncate px-3 py-2 text-xs text-muted-foreground">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="button"
          onClick={handleVerify}
          disabled={isPending || !canSubmit}
          className="gap-2"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
          {isPending ? "Analisando..." : "Verificar padrão de escrita"}
        </Button>

        {result ? <ResultPanel result={result} /> : null}
      </CardContent>
    </Card>
  );
}
