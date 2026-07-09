"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, Loader2, Sparkles } from "lucide-react";

import { generateClinicalReportWithAiAction } from "@/app/actions/ai-report-training-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { AiReportGenerationResult } from "@/lib/ai-report-training/types";

type TrainedContextOption = {
  trainingContextKey: string;
  contextLabel?: string;
  isReady: boolean;
};

type AiReportGeneratorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTrainingContextKey?: string;
  /** @deprecated Use defaultTrainingContextKey */
  defaultClinicalArea?: string;
  trainedContexts: TrainedContextOption[];
  /** @deprecated Use trainedContexts */
  trainedAreas?: TrainedContextOption[];
};

export function AiReportGeneratorDialog({
  open,
  onOpenChange,
  defaultTrainingContextKey,
  defaultClinicalArea,
  trainedContexts,
  trainedAreas,
}: AiReportGeneratorDialogProps) {
  const toast = useAppToast();
  const contexts = trainedContexts.length > 0 ? trainedContexts : (trainedAreas ?? []);
  const readyContexts = contexts.filter((context) => context.isReady);
  const defaultKey =
    defaultTrainingContextKey ?? defaultClinicalArea ?? readyContexts[0]?.trainingContextKey ?? "";

  const [trainingContextKey, setTrainingContextKey] = useState(defaultKey);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [evaluationPeriod, setEvaluationPeriod] = useState("");
  const [clinicalDemand, setClinicalDemand] = useState("");
  const [sessionSummary, setSessionSummary] = useState("");
  const [therapeuticGoals, setTherapeuticGoals] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [result, setResult] = useState<AiReportGenerationResult | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && defaultKey) {
      setTrainingContextKey(defaultKey);
    }
  }, [open, defaultKey]);

  function handleGenerate() {
    setResult(null);
    startTransition(async () => {
      const response = await generateClinicalReportWithAiAction({
        trainingContextKey,
        patientName,
        patientAge,
        evaluationPeriod,
        clinicalDemand,
        sessionSummary,
        therapeuticGoals,
        additionalNotes,
      });

      if (!response.success || !response.data) {
        toast.error({
          title: "Geração falhou",
          description: response.error,
        });
        return;
      }

      setResult(response.data);
      toast.success({ title: "Documento gerado pela IA." });
    });
  }

  async function handleCopy() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.bodyText);
    toast.success({ title: "Conteúdo copiado." });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" aria-hidden />
            Gerar Relatório com IA
          </DialogTitle>
          <DialogDescription>
            Informe os dados básicos do paciente. A IA usa o padrão treinado do
            contexto selecionado (área, avaliação ou tipo de relatório).
          </DialogDescription>
        </DialogHeader>

        {readyContexts.length === 0 ? (
          <p className="text-sm text-destructive">
            Nenhum contexto com IA treinada. Salve 5 documentos manuais e execute
            o treinamento primeiro.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contexto</Label>
              <Select
                value={trainingContextKey}
                items={readyContexts.map((context) => ({
                  label: context.contextLabel ?? context.trainingContextKey,
                  value: context.trainingContextKey,
                }))}
                onValueChange={(value) =>
                  setTrainingContextKey(String(value ?? ""))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contexto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {readyContexts.map((context) => (
                      <SelectItem
                        key={context.trainingContextKey}
                        value={context.trainingContextKey}
                      >
                        {context.contextLabel ?? context.trainingContextKey}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ai-patient-name">Nome do paciente *</Label>
                <Input
                  id="ai-patient-name"
                  value={patientName}
                  onChange={(event) => setPatientName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-patient-age">Idade</Label>
                <Input
                  id="ai-patient-age"
                  value={patientAge}
                  onChange={(event) => setPatientAge(event.target.value)}
                  placeholder="Ex.: 7 anos"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-period">Período da avaliação *</Label>
              <Input
                id="ai-period"
                value={evaluationPeriod}
                onChange={(event) => setEvaluationPeriod(event.target.value)}
                placeholder="Ex.: Janeiro a março de 2026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-demand">Demanda clínica *</Label>
              <Textarea
                id="ai-demand"
                value={clinicalDemand}
                onChange={(event) => setClinicalDemand(event.target.value)}
                placeholder="Motivo do acompanhamento, queixa principal..."
                className="min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-sessions">Resumo das sessões</Label>
              <Textarea
                id="ai-sessions"
                value={sessionSummary}
                onChange={(event) => setSessionSummary(event.target.value)}
                className="min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-goals">Objetivos terapêuticos</Label>
              <Textarea
                id="ai-goals"
                value={therapeuticGoals}
                onChange={(event) => setTherapeuticGoals(event.target.value)}
                className="min-h-16"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-notes">Observações adicionais</Label>
              <Textarea
                id="ai-notes"
                value={additionalNotes}
                onChange={(event) => setAdditionalNotes(event.target.value)}
                className="min-h-16"
              />
            </div>

            {result ? (
              <div className="space-y-2 rounded-xl border border-border/70 bg-muted/15 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {result.title}
                  </p>
                  {result.mockMode ? (
                    <Badge variant="outline">Modo demonstração</Badge>
                  ) : null}
                </div>
                <div
                  className="prose prose-sm max-w-none text-foreground/90 dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: result.bodyHtml }}
                />
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {result ? (
            <Button type="button" variant="outline" onClick={handleCopy}>
              <Copy className="size-4" aria-hidden />
              Copiar texto
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isPending || readyContexts.length === 0}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="size-4" aria-hidden />
            )}
            Gerar relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
