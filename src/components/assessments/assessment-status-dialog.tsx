"use client";

import { useState, useTransition } from "react";
import { HelpCircle } from "lucide-react";

import { toggleAssessmentTemplateStatusAction } from "@/app/actions/assessment-template-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAssessmentStatusToggleMessage, getAssessmentToggleActionLabel } from "@/lib/assessment-format";
import type { AssessmentTemplateRow } from "@/lib/supabase/database.types";

type AssessmentStatusDialogProps = {
  template: AssessmentTemplateRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChanged: (template: AssessmentTemplateRow) => void;
};

export function AssessmentStatusDialog({
  template,
  open,
  onOpenChange,
  onStatusChanged,
}: AssessmentStatusDialogProps) {
  const toast = useAppToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!template) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await toggleAssessmentTemplateStatusAction(template.id);

      if (!result.success) {
        const message = result.error ?? "Não foi possível alterar o status.";
        setError(message);
        toast.error({ title: "Falha na alteração", description: message });
        return;
      }

      if (!result.data?.template) {
        const message = "Não foi possível alterar o status.";
        setError(message);
        toast.error({ title: "Falha na alteração", description: message });
        return;
      }

      const isActive = result.data.template.status === "active";
      toast.success({
        title: isActive ? "Avaliação ativada" : "Avaliação inativada",
        description: `O status de ${template.name} foi alterado.`,
      });

      onStatusChanged(result.data.template);
      onOpenChange(false);
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setError(null);
    }

    onOpenChange(nextOpen);
  }

  const actionLabel = template
    ? getAssessmentToggleActionLabel(template.status)
    : "Alterar";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {template ? (
        <DialogContent className="gap-0 p-0 sm:max-w-md" showCloseButton={false}>
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-muted-foreground/25 text-muted-foreground">
              <HelpCircle className="size-8 stroke-[1.5]" aria-hidden />
            </div>

            <DialogHeader className="mt-5 space-y-3 text-center sm:text-center">
              <DialogTitle className="text-lg font-semibold">
                Deseja alterar o status da avaliação?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {getAssessmentStatusToggleMessage(actionLabel, template.name)}
              </DialogDescription>
            </DialogHeader>

            {error ? (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            ) : null}

            <div className="mt-8 grid w-full grid-cols-2 gap-3">
              <Button
                type="button"
                className="h-11 bg-clinical-success text-white hover:bg-clinical-success/90"
                disabled={isPending}
                onClick={handleConfirm}
              >
                {isPending ? "Confirmando..." : "Confirmar"}
              </Button>
              <Button
                type="button"
                className="h-11 bg-destructive text-white hover:bg-destructive/90"
                disabled={isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
