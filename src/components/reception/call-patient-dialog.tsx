"use client";

import { useEffect, useState, useTransition } from "react";
import { Megaphone } from "lucide-react";

import { callPatientAction } from "@/app/actions/reception-panel-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatQueueNumber } from "@/lib/reception-panel";
import type { DailyAppointment } from "@/lib/agenda-types";

type CallPatientDialogProps = {
  appointment: DailyAppointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCalled: (appointment: DailyAppointment) => void;
};

export function CallPatientDialog({
  appointment,
  open,
  onOpenChange,
  onPatientCalled,
}: CallPatientDialogProps) {
  const toast = useAppToast();
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setRoomName(appointment?.roomName ?? "");
      setError(null);
    }
  }, [appointment, open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!appointment) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await callPatientAction({
        appointmentId: appointment.id,
        patientName: appointment.patient,
        professionalName: appointment.professional,
        eventDate: appointment.date,
        startTime: appointment.time,
        endTime: appointment.endTime,
        roomName,
        queueNumber: appointment.queueNumber,
      });

      if (!result.success || !result.data?.appointment) {
        const message = result.error ?? "Não foi possível chamar o paciente.";
        setError(message);
        toast.error({ title: "Falha na chamada", description: message });
        return;
      }

      toast.success({
        title: "Paciente chamado",
        description: `${appointment.patient} foi exibido no painel da recepção.`,
      });

      onPatientCalled(result.data.appointment);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {appointment ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="size-5 text-primary" aria-hidden />
              Chamar paciente
            </DialogTitle>
            <DialogDescription>
              A chamada será exibida no painel da recepção com a senha, sala e
              profissional.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">{appointment.patient}</p>
              <p className="mt-1 text-muted-foreground">
                Profissional: {appointment.professional}
              </p>
              {appointment.queueNumber ? (
                <p className="mt-1 font-semibold text-primary">
                  Senha: {formatQueueNumber(appointment.queueNumber)}
                </p>
              ) : (
                <p className="mt-1 text-muted-foreground">
                  A senha será gerada automaticamente.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-name">Sala *</Label>
              <Input
                id="room-name"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="Ex.: Sala 2, Consultório A"
                className="h-11"
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Chamando..." : "Chamar no painel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
