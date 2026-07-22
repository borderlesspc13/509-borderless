"use client";

import { useState } from "react";
import { Check, Copy, FileText, Loader2 } from "lucide-react";

import { mergePediIntoToReportAction } from "@/app/actions/pedi-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppToast } from "@/hooks/use-app-toast";
import type { PediCapability, PediScoreResult } from "@/lib/pedi";

type PediToReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  birthDate?: string;
  evaluationDate: string;
  items: Record<string, PediCapability>;
  scores: PediScoreResult;
  professionalName?: string;
  professionalRole?: string;
};

export function PediToReportDialog({
  open,
  onOpenChange,
  patientName,
  birthDate,
  evaluationDate,
  items,
  scores,
  professionalName,
  professionalRole,
}: PediToReportDialogProps) {
  const toast = useAppToast();
  const [html, setHtml] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    setCopied(false);
    try {
      const result = await mergePediIntoToReportAction({
        patientName,
        birthDate,
        evaluationDate,
        items,
        scores,
        professionalName,
        professionalRole,
      });

      if (!result.success || !result.data) {
        toast.error({
          title: "Falha ao gerar relatório",
          description: result.error,
        });
        return;
      }

      setHtml(result.data.html);
      setTemplateName(result.data.templateName);
      toast.success({ title: "Relatório TO preenchido com dados PEDI." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      toast.success({
        title: "HTML copiado",
        description: "Cole no editor de evolução ou em Modelos.",
      });
    } catch {
      toast.error({ title: "Não foi possível copiar." });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setHtml(null);
          setTemplateName(null);
          setCopied(false);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4" aria-hidden />
            Relatório TO a partir do PEDI
          </DialogTitle>
          <DialogDescription>
            Preenche automaticamente os placeholders `[PEDI_*]`, `[MAPA_ITENS_*]`
            e `[PEDI_ASC_*]` (quando a Parte II estiver respondida). Demais
            campos ficam destacados em amarelo para edição manual.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {!html ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              Gere o merge com o modelo cadastrado de Terapia Ocupacional.
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Modelo: <strong className="text-foreground">{templateName}</strong>
              </p>
              <div
                className="prose prose-sm max-w-none rounded-xl border border-border/70 bg-card p-4 dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </>
          )}
        </div>

        <DialogFooter className="border-t border-border/60 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {html ? (
            <Button type="button" variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              {copied ? "Copiado" : "Copiar HTML"}
            </Button>
          ) : null}
          <Button type="button" disabled={isLoading} onClick={handleGenerate}>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <FileText className="size-4" aria-hidden />
            )}
            {html ? "Regenerar" : "Gerar relatório"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
