"use client";

import { useState, useTransition } from "react";
import { HelpCircle } from "lucide-react";

import { toggleProfessionalStatusAction } from "@/app/actions/team-actions";
import type { TeamMember } from "@/app/actions/team-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getProfessionalDisplaySubtitle,
  getProfessionalStatusToggleMessage,
  getProfessionalToggleActionLabel,
} from "@/lib/professional-format";

type ProfessionalStatusDialogProps = {
  professional: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChanged: (professional: TeamMember) => void;
};

export function ProfessionalStatusDialog({
  professional,
  open,
  onOpenChange,
  onStatusChanged,
}: ProfessionalStatusDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!professional) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await toggleProfessionalStatusAction(professional.id);

      if (!result.success) {
        setError(result.error ?? "Não foi possível alterar o status.");
        return;
      }

      if (!result.data?.professional) {
        setError("Não foi possível alterar o status.");
        return;
      }

      onStatusChanged(result.data.professional);
      onOpenChange(false);
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setError(null);
    }

    onOpenChange(nextOpen);
  }

  const actionLabel = professional
    ? getProfessionalToggleActionLabel(professional.status)
    : "Alterar";

  const subtitle = professional
    ? getProfessionalDisplaySubtitle(
        professional.cpf,
        professional.professionalCouncil
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {professional ? (
        <DialogContent className="gap-0 p-0 sm:max-w-md" showCloseButton={false}>
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-muted-foreground/25 text-muted-foreground">
              <HelpCircle className="size-8 stroke-[1.5]" aria-hidden />
            </div>

            <DialogHeader className="mt-5 space-y-3 text-center sm:text-center">
              <DialogTitle className="text-lg font-semibold">
                Deseja alterar o status do profissional?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {getProfessionalStatusToggleMessage(
                  actionLabel,
                  professional.fullName,
                  subtitle
                )}
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
