"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppointmentStatus } from "@/lib/agenda-types";

const statusLabels: Record<"confirmado" | "cancelado", string> = {
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

type AppointmentBulkStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  status: "confirmado" | "cancelado";
  affectedCount: number;
  onConfirm: (applyToAll: boolean) => void;
};

export function AppointmentBulkStatusDialog({
  open,
  onOpenChange,
  patientName,
  status,
  affectedCount,
  onConfirm,
}: AppointmentBulkStatusDialogProps) {
  const statusLabel = statusLabels[status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aplicar situação em massa?</DialogTitle>
          <DialogDescription>
            Deseja aplicar esta situação a todos os atendimentos de{" "}
            <span className="font-medium text-foreground">{patientName}</span> no
            dia de hoje?
            {affectedCount > 1 ? (
              <>
                {" "}
                Isso afetará{" "}
                <span className="font-medium text-foreground">
                  {affectedCount} atendimentos
                </span>
                .
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onConfirm(false)}
          >
            Apenas este atendimento
          </Button>
          <Button type="button" onClick={() => onConfirm(true)}>
            Aplicar a todos ({statusLabel})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
