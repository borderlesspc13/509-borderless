"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  deleteAiReportTrainingSampleAction,
  getAiWritingTrainingStateAction,
  saveAiReportTrainingSampleAction,
  trainAiReportAreaAction,
} from "@/app/actions/ai-report-training-actions";
import { AiReportGeneratorDialog } from "@/components/clinical-reports/ai-report-generator-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_REPORT_TRAINING_SAMPLE_LIMIT,
  AI_REPORT_TRAINING_STATUS_LABELS,
  getAiWritingTrainingContextLabel,
} from "@/lib/ai-report-training/constants";
import type { AiReportAreaTrainingState } from "@/lib/ai-report-training/types";
import { cn } from "@/lib/utils";

const statusBadgeClass: Record<string, string> = {
  not_started: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  collecting: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  ready: "border-clinical-success/30 bg-clinical-success/10 text-clinical-success",
  stale: "border-destructive/30 bg-destructive/10 text-destructive",
};

type AiWritingTrainingWidgetProps = {
  trainingContextKey: string;
  contextLabel?: string;
  defaultExpanded?: boolean;
  className?: string;
};

export function AiWritingTrainingWidget({
  trainingContextKey,
  contextLabel,
  defaultExpanded = false,
  className,
}: AiWritingTrainingWidgetProps) {
  const toast = useAppToast();
  const label = contextLabel ?? getAiWritingTrainingContextLabel(trainingContextKey);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [state, setState] = useState<AiReportAreaTrainingState | null>(null);
  const [sortOrder, setSortOrder] = useState(1);
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [isLoading, startLoadTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [isTraining, startTrainTransition] = useTransition();

  const loadState = useCallback(() => {
    startLoadTransition(async () => {
      const result = await getAiWritingTrainingStateAction({ trainingContextKey });
      if (result.success && result.data) {
        setState(result.data);
      }
    });
  }, [trainingContextKey]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  function handleSaveSample() {
    startSaveTransition(async () => {
      const result = await saveAiReportTrainingSampleAction({
        trainingContextKey,
        sortOrder,
        title,
        bodyText,
      });

      if (!result.success) {
        toast.error({
          title: "Não foi possível salvar",
          description: result.error,
        });
        return;
      }

      toast.success({ title: `Documento ${sortOrder} salvo para treinamento.` });
      setTitle("");
      setBodyText("");
      loadState();
    });
  }

  function handleTrain() {
    startTrainTransition(async () => {
      const result = await trainAiReportAreaAction({ trainingContextKey });

      if (!result.success) {
        toast.error({
          title: "Treinamento falhou",
          description: result.error,
        });
        return;
      }

      toast.success({
        title: "IA treinada",
        description: result.data?.mockMode
          ? "Modo demonstração — configure OPENAI_API_KEY para treino real."
          : `Padrão salvo para ${label}.`,
      });
      loadState();
    });
  }

  function handleDeleteSample(sampleId: string) {
    startSaveTransition(async () => {
      const result = await deleteAiReportTrainingSampleAction({ sampleId });
      if (!result.success) {
        toast.error({ title: "Erro ao remover", description: result.error });
        return;
      }
      toast.success({ title: "Amostra removida." });
      loadState();
    });
  }

  const memoryStatus = state?.memory.status ?? "not_started";

  return (
    <>
      <Card className={cn("border-border/70", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="size-4 text-primary" aria-hidden />
                IA — {label}
              </CardTitle>
              <CardDescription>
                Salve {AI_REPORT_TRAINING_SAMPLE_LIMIT} documentos manuais,
                treine a IA e gere novos com o padrão aprendido.
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant="outline"
                className={cn("text-[0.65rem]", statusBadgeClass[memoryStatus])}
              >
                {AI_REPORT_TRAINING_STATUS_LABELS[memoryStatus]}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setExpanded((current) => !current)}
                aria-label={expanded ? "Recolher" : "Expandir"}
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    expanded && "rotate-180"
                  )}
                />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {state?.isReady ? (
              <Button
                type="button"
                size="sm"
                className="gap-2"
                onClick={() => setGeneratorOpen(true)}
              >
                <Sparkles className="size-4" aria-hidden />
                Gerar Relatório com IA
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setExpanded(true)}
            >
              {state?.samples.length ?? 0}/{AI_REPORT_TRAINING_SAMPLE_LIMIT}{" "}
              amostras
            </Button>
          </div>
        </CardHeader>

        {expanded ? (
          <CardContent className="space-y-4 border-t border-border/60 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Posição (1–5)</Label>
                <Select
                  value={String(sortOrder)}
                  items={Array.from(
                    { length: AI_REPORT_TRAINING_SAMPLE_LIMIT },
                    (_, index) => ({
                      label: `Documento ${index + 1}`,
                      value: String(index + 1),
                    })
                  )}
                  onValueChange={(value) => setSortOrder(Number(value ?? 1))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Array.from(
                        { length: AI_REPORT_TRAINING_SAMPLE_LIMIT },
                        (_, index) => (
                          <SelectItem
                            key={index + 1}
                            value={String(index + 1)}
                          >
                            Documento {index + 1}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Relatório trimestral"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Conteúdo manual de referência</Label>
              <Textarea
                value={bodyText}
                onChange={(event) => setBodyText(event.target.value)}
                placeholder="Cole o documento completo redigido manualmente..."
                className="min-h-36"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveSample}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="size-4" aria-hidden />
                )}
                Salvar amostra
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleTrain}
                disabled={isTraining || !state?.canTrain || isLoading}
                className="gap-2"
              >
                {isTraining ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Brain className="size-4" aria-hidden />
                )}
                Treinar IA
              </Button>
            </div>

            {state && state.samples.length > 0 ? (
              <div className="space-y-2">
                {state.samples.map((sample) => (
                  <div
                    key={sample.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/10 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        #{sample.sortOrder} — {sample.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {sample.bodyText}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteSample(sample.id)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            {state?.isReady ? (
              <div className="rounded-lg border border-clinical-success/30 bg-clinical-success/5 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-clinical-success">
                  <CheckCircle2 className="size-4" aria-hidden />
                  IA pronta para {label}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {state.memory.patternSummary}
                </p>
              </div>
            ) : null}
          </CardContent>
        ) : null}
      </Card>

      <AiReportGeneratorDialog
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
        defaultTrainingContextKey={trainingContextKey}
        trainedContexts={
          state?.isReady
            ? [{ trainingContextKey, contextLabel: label, isReady: true }]
            : []
        }
      />
    </>
  );
}
