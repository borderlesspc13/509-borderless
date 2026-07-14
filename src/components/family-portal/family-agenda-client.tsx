"use client";

import { useTransition } from "react";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

import { updateFamilyPortalAgendaStatusAction, type FamilyAgendaEvent } from "@/app/actions/family-portal-agenda-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";

export function FamilyAgendaClient({ events }: { events: FamilyAgendaEvent[] }) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (eventId: string, newStatus: "confirmado" | "cancelado") => {
    startTransition(async () => {
      const result = await updateFamilyPortalAgendaStatusAction(eventId, newStatus);
      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }
      toast.success({ title: "Status atualizado", description: `A consulta foi ${newStatus}.` });
    });
  };

  if (events.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center">
        <Calendar className="mb-4 size-10 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Nenhuma consulta agendada.</p>
        <p className="text-sm text-muted-foreground">Você não possui agendamentos futuros no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const isConfirmado = event.status === "confirmado";
        const isCancelado = event.status === "cancelado";
        const isPendingAction = event.status === "agendado" || event.status === "pendente";

        return (
          <div key={event.id} className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{event.title || "Sessão"}</span>
                {isConfirmado && <span className="rounded-full bg-clinical-success/10 px-2 py-0.5 text-[10px] font-medium text-clinical-success">Confirmado</span>}
                {isCancelado && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">Cancelado</span>}
                {isPendingAction && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">Aguardando Confirmação</span>}
              </div>
              <p className="text-sm text-muted-foreground">Profissional: {event.professionalName}</p>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {new Date(event.eventDate).toLocaleDateString("pt-BR")}</span>
                <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {event.startTime.slice(0, 5)} - {event.endTime.slice(0, 5)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(!isConfirmado && !isCancelado) && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    disabled={isPending}
                    onClick={() => handleUpdateStatus(event.id, "cancelado")}
                  >
                    <XCircle className="mr-1.5 size-4" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-clinical-success hover:bg-clinical-success/90"
                    disabled={isPending}
                    onClick={() => handleUpdateStatus(event.id, "confirmado")}
                  >
                    <CheckCircle className="mr-1.5 size-4" />
                    Confirmar
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
