"use client";

import { useEffect, useState } from "react";
import { Clock, UserRound } from "lucide-react";

import { getAppointmentFinancialAction } from "@/app/actions/agenda-financial-actions";
import { AppointmentFinancialSection } from "@/components/dashboard/appointment-financial-section";
import { AppointmentStatusBadge } from "@/components/dashboard/appointment-status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFullDate } from "@/lib/calendar-utils";
import type { DailyAppointment } from "@/lib/dashboard-mock-data";

type AppointmentDetailDialogProps = {
  appointment: DailyAppointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentUpdate: (appointment: DailyAppointment) => void;
};

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  onAppointmentUpdate,
}: AppointmentDetailDialogProps) {
  const [currentAppointment, setCurrentAppointment] =
    useState<DailyAppointment | null>(appointment);
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(false);

  useEffect(() => {
    setCurrentAppointment(appointment);
  }, [appointment]);

  useEffect(() => {
    if (!open || !appointment) {
      return;
    }

    setIsLoadingFinancial(true);

    void getAppointmentFinancialAction(appointment.id).then((result) => {
      if (result.success && result.data?.appointment) {
        setCurrentAppointment(result.data.appointment);
      } else {
        setCurrentAppointment(appointment);
      }

      setIsLoadingFinancial(false);
    });
  }, [open, appointment]);

  if (!currentAppointment) {
    return null;
  }

  function handleAppointmentUpdate(updated: DailyAppointment) {
    setCurrentAppointment(updated);
    onAppointmentUpdate(updated);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92dvh,820px)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalhes do agendamento</DialogTitle>
          <DialogDescription>
            {formatFullDate(currentAppointment.date)} ·{" "}
            {currentAppointment.time} – {currentAppointment.endTime}
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <p className="text-base font-semibold">{currentAppointment.patient}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <UserRound className="size-3.5 shrink-0" aria-hidden />
                {currentAppointment.professional}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-3.5 shrink-0" aria-hidden />
                {currentAppointment.time} – {currentAppointment.endTime}
              </p>
            </div>
            <AppointmentStatusBadge status={currentAppointment.status} />
          </div>
        </section>

        {isLoadingFinancial ? (
          <p className="text-sm text-muted-foreground">
            Carregando dados financeiros...
          </p>
        ) : (
          <AppointmentFinancialSection
            appointment={currentAppointment}
            onAppointmentUpdate={handleAppointmentUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
