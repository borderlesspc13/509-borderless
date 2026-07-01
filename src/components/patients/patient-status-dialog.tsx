"use client";

import { useState, useTransition } from "react";
import { HelpCircle } from "lucide-react";

import { togglePatientStatusAction } from "@/app/actions/patient-record-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getPatientStatusToggleMessage,
  getPatientToggleActionLabel,
} from "@/lib/patient-format";
import type { PatientRow } from "@/lib/supabase/database.types";

type PatientStatusDialogProps = {
  patient: PatientRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChanged: (patient: PatientRow) => void;
};

export function PatientStatusDialog({
  patient,
  open,
  onOpenChange,
  onStatusChanged,
}: PatientStatusDialogProps) {
  const toast = useAppToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!patient) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await togglePatientStatusAction(patient.id);

      if (!result.success || !result.data?.patient) {
        const message = result.error ?? "Não foi possível alterar o status.";
        setError(message);
        toast.error({ title: "Falha na alteração", description: message });
        return;
      }

      const isActive = result.data.patient.status === "active";
      toast.success({
        title: isActive ? "Aprendiz ativado" : "Aprendiz inativado",
        description: `O status de ${patient.full_name} foi alterado.`,
      });

      onStatusChanged(result.data.patient);
      onOpenChange(false);
    });
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setError(null);
    }

    onOpenChange(open);
  }

  const actionLabel = patient
    ? getPatientToggleActionLabel(patient.status)
    : "Alterar";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {patient ? (
        <DialogContent className="gap-0 p-0 sm:max-w-md" showCloseButton={false}>
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-muted-foreground/25 text-muted-foreground">
              <HelpCircle className="size-8 stroke-[1.5]" aria-hidden />
            </div>

            <DialogHeader className="mt-5 space-y-3 text-center sm:text-center">
              <DialogTitle className="text-lg font-semibold">
                Deseja alterar o status do aprendiz?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {getPatientStatusToggleMessage(
                  actionLabel,
                  patient.full_name,
                  patient.diagnosis
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
