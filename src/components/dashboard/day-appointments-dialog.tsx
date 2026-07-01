"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Eye, Plus } from "lucide-react";

import { AgendaDropZone } from "@/components/dashboard/agenda-drop-zone";
import { AppointmentDetailDialog } from "@/components/dashboard/appointment-detail-dialog";
import { AppointmentBulkStatusDialog } from "@/components/dashboard/appointment-bulk-status-dialog";
import { AppointmentCard } from "@/components/dashboard/appointment-card";
import {
  NewAppointmentDialog,
  type NewAppointmentDefaults,
} from "@/components/dashboard/new-appointment-dialog";
import { VacantSlotCard } from "@/components/dashboard/vacant-slot-card";
import { CallPatientDialog } from "@/components/reception/call-patient-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAgendaAudit } from "@/hooks/use-agenda-audit";
import { useAgendaStatusSync } from "@/hooks/use-agenda-status-sync";
import { useTouchScrollGuard } from "@/hooks/use-touch-scroll-guard";
import { useUserRole } from "@/hooks/use-user-role";
import {
  buildDateMoveLog,
  buildProfessionalMoveLog,
  collectStatusChangeLogs,
  type CreateAuditLogInput,
} from "@/lib/audit-log";
import {
  applyStatusUpdate,
  getPatientAppointmentsToday,
  requiresBulkConfirmation,
  type BulkStatus,
} from "@/lib/appointment-status-utils";
import {
  moveAppointmentToDate,
  moveAppointmentToProfessional,
} from "@/lib/appointment-move-utils";
import {
  getVacantSlotsForDate,
  type AgendaFilters,
  type VacantSlot,
} from "@/lib/agenda-filter-utils";
import { useAppToast } from "@/hooks/use-app-toast";
import { formatFullDate } from "@/lib/calendar-utils";
import { appointmentStatusLabels } from "@/lib/patient-format";
import type {
  AppointmentStatus,
  DailyAppointment,
} from "@/lib/agenda-types";
import { PERMISSIONS } from "@/lib/rbac";
import type { AgendaProfessional } from "@/lib/agenda-professionals";

type PendingStatusUpdate = {
  appointmentId: string;
  patientName: string;
  status: BulkStatus;
  affectedCount: number;
};

type DayAppointmentsDialogProps = {
  dateKey: string | null;
  appointments: DailyAppointment[];
  allAppointments: DailyAppointment[];
  filters: AgendaFilters;
  professionals: AgendaProfessional[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentsChange: (appointments: DailyAppointment[]) => void;
  onAppointmentCreated?: (appointment: DailyAppointment) => void;
  onRefreshAppointments?: () => void;
};

function getNearbyDateKeys(dateKey: string, count = 5) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const baseDate = new Date(year, month - 1, day);
  const dates: string[] = [];

  for (let offset = 1; offset <= count; offset += 1) {
    const nextDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate() + offset
    );
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, "0");
    const nextDay = String(nextDate.getDate()).padStart(2, "0");

    dates.push(`${nextYear}-${nextMonth}-${nextDay}`);
  }

  return dates;
}

function formatShortDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function DayAppointmentsDialog({
  dateKey,
  appointments,
  allAppointments,
  filters,
  professionals,
  open,
  onOpenChange,
  onAppointmentsChange,
  onAppointmentCreated,
  onRefreshAppointments,
}: DayAppointmentsDialogProps) {
  const { isAgendaReadOnly, canDragAppointments, canManageAgenda, hasPermission } =
    useUserRole();
  const { recordAuditLogs } = useAgendaAudit();
  const { syncAppointmentStatus } = useAgendaStatusSync();
  const { onTouchStart, onTouchMove, onTouchEnd } = useTouchScrollGuard();
  const toast = useAppToast();
  const [pendingUpdate, setPendingUpdate] =
    useState<PendingStatusUpdate | null>(null);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [appointmentDefaults, setAppointmentDefaults] =
    useState<NewAppointmentDefaults | null>(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [detailAppointment, setDetailAppointment] =
    useState<DailyAppointment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [callAppointment, setCallAppointment] =
    useState<DailyAppointment | null>(null);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  const canViewFinancialDetails = hasPermission(PERMISSIONS.FINANCE_MANAGE);

  const showVacantOnly = filters.availability === "vacant";
  const vacantSlots = dateKey
    ? getVacantSlotsForDate(dateKey, allAppointments, filters, professionals)
    : [];
  const waitingCount = appointments.filter(
    (item) => item.status === "em_espera"
  ).length;

  const nearbyDateKeys = useMemo(
    () => (dateKey ? getNearbyDateKeys(dateKey) : []),
    [dateKey]
  );

  function getDescription() {
    if (isAgendaReadOnly) {
      return "Visualização da agenda do dia. Alterações não estão disponíveis para o seu perfil.";
    }

    if (showVacantOnly) {
      if (vacantSlots.length > 0) {
        return `${vacantSlots.length} horário${vacantSlots.length > 1 ? "s" : ""} vago${vacantSlots.length > 1 ? "s" : ""} disponível${vacantSlots.length > 1 ? "is" : ""}`;
      }

      return "Nenhum horário vago encontrado com os filtros atuais.";
    }

    if (appointments.length > 0) {
      return `${appointments.length} atendimento${appointments.length > 1 ? "s" : ""} agendado${appointments.length > 1 ? "s" : ""}${waitingCount > 0 ? ` · ${waitingCount} em espera` : ""}`;
    }

    return "Nenhum atendimento agendado para este dia.";
  }

  function applyAppointmentsChange(
    nextAppointments: DailyAppointment[],
    auditLogs: CreateAuditLogInput[]
  ) {
    onAppointmentsChange(nextAppointments);
    void recordAuditLogs(auditLogs);
  }

  function handleScheduleVacantSlot(slot: VacantSlot) {
    if (!dateKey) {
      return;
    }

    setAppointmentDefaults({
      professionalName: slot.professional,
      professionalRole: slot.role ?? undefined,
      eventDate: dateKey,
      startTime: slot.time,
      endTime: slot.endTime,
    });
    setIsAppointmentDialogOpen(true);
  }

  function updateStatus(
    appointmentId: string,
    newStatus: AppointmentStatus,
    applyToAllPatientToday = false
  ) {
    if (!canManageAgenda) {
      return;
    }

    const target = allAppointments.find(
      (appointment) => appointment.id === appointmentId
    );

    if (!target) {
      return;
    }

    const nextAppointments = applyStatusUpdate(
      allAppointments,
      appointmentId,
      newStatus,
      applyToAllPatientToday
    );

    const affectedIds = applyToAllPatientToday
      ? getPatientAppointmentsToday(allAppointments, target.patient).map(
          (appointment) => appointment.id
        )
      : [appointmentId];

    const auditLogs = collectStatusChangeLogs(
      allAppointments,
      nextAppointments,
      affectedIds,
      { isBulk: applyToAllPatientToday }
    );

    applyAppointmentsChange(nextAppointments, auditLogs);

    const statusLabel = appointmentStatusLabels[newStatus] ?? newStatus;
    const bulkMessage = applyToAllPatientToday
      ? `${affectedIds.length} atendimento${affectedIds.length > 1 ? "s" : ""} de ${target.patient} atualizado${affectedIds.length > 1 ? "s" : ""} para ${statusLabel}.`
      : `Situação de ${target.patient} alterada para ${statusLabel}.`;

    toast.success({
      title: applyToAllPatientToday ? "Status aplicado em massa" : "Status atualizado",
      description: bulkMessage,
    });

    const updatedAppointments = nextAppointments.filter((appointment) =>
      affectedIds.includes(appointment.id)
    );

    updatedAppointments.forEach((appointment) => {
      void syncAppointmentStatus(appointment, newStatus).then((synced) => {
        if (!synced) {
          toast.error({
            title: "Falha na sincronização",
            description:
              "Não foi possível sincronizar o status com o servidor.",
          });
          return;
        }

        onAppointmentsChange(
          nextAppointments.map((item) =>
            item.id === synced.id ? synced : item
          )
        );
      });
    });
  }

  function handleStatusChange(
    appointmentId: string,
    newStatus: AppointmentStatus
  ) {
    if (!canManageAgenda) {
      return;
    }

    const appointment = allAppointments.find((item) => item.id === appointmentId);

    if (!appointment || appointment.status === newStatus) {
      return;
    }

    if (requiresBulkConfirmation(newStatus)) {
      const todayPatientAppointments = getPatientAppointmentsToday(
        allAppointments,
        appointment.patient
      );

      setPendingUpdate({
        appointmentId,
        patientName: appointment.patient,
        status: newStatus,
        affectedCount: todayPatientAppointments.length,
      });
      setIsBulkDialogOpen(true);
      return;
    }

    updateStatus(appointmentId, newStatus);
  }

  function handleMoveToDate(targetDate: string) {
    return (appointmentId: string) => {
      if (!canDragAppointments) {
        return;
      }

      const appointment = allAppointments.find(
        (item) => item.id === appointmentId
      );

      if (!appointment || appointment.date === targetDate) {
        return;
      }

      const nextAppointments = moveAppointmentToDate(
        allAppointments,
        appointmentId,
        targetDate
      );

      applyAppointmentsChange(nextAppointments, [
        buildDateMoveLog(appointment, targetDate),
      ]);

      toast.success({
        title: "Agendamento movido",
        description: `Transferido para ${formatShortDate(targetDate)}.`,
      });
    };
  }

  function handleMoveToProfessional(professionalName: string) {
    return (appointmentId: string) => {
      if (!canDragAppointments) {
        return;
      }

      const appointment = allAppointments.find(
        (item) => item.id === appointmentId
      );

      if (!appointment || appointment.professional === professionalName) {
        return;
      }

      const nextAppointments = moveAppointmentToProfessional(
        allAppointments,
        appointmentId,
        professionalName
      );

      applyAppointmentsChange(nextAppointments, [
        buildProfessionalMoveLog(appointment, professionalName),
      ]);

      toast.success({
        title: "Profissional alterado",
        description: `Atendimento transferido para ${professionalName}.`,
      });
    };
  }

  function handleBulkConfirm(applyToAll: boolean) {
    if (!pendingUpdate) {
      return;
    }

    updateStatus(
      pendingUpdate.appointmentId,
      pendingUpdate.status,
      applyToAll
    );
    setIsBulkDialogOpen(false);
    setPendingUpdate(null);
  }

  function handleAppointmentFinancialUpdate(updated: DailyAppointment) {
    const nextAppointments = allAppointments.map((item) =>
      item.id === updated.id ? updated : item
    );

    onAppointmentsChange(nextAppointments);
  }

  function handleViewAppointmentDetails(appointment: DailyAppointment) {
    setDetailAppointment(appointment);
    setIsDetailDialogOpen(true);
  }

  function handleOpenCallDialog(appointment: DailyAppointment) {
    setCallAppointment(appointment);
    setIsCallDialogOpen(true);
  }

  function handlePatientCalled(calledAppointment: DailyAppointment) {
    const nextAppointments = allAppointments.map((appointment) =>
      appointment.id === calledAppointment.id ? calledAppointment : appointment
    );

    applyAppointmentsChange(nextAppointments, []);
  }

  function handleBulkDialogOpenChange(nextOpen: boolean) {
    setIsBulkDialogOpen(nextOpen);

    if (!nextOpen) {
      setPendingUpdate(null);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[min(92dvh,820px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl">
          <DialogHeader className="gap-3 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start gap-3 pr-8">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <CalendarDays className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-lg capitalize sm:text-xl">
                    {dateKey ? formatFullDate(dateKey) : "Agenda do dia"}
                  </DialogTitle>
                  {isAgendaReadOnly ? (
                    <Badge
                      variant="outline"
                      className="gap-1 border-muted-foreground/30 text-muted-foreground"
                    >
                      <Eye className="size-3" aria-hidden />
                      Somente leitura
                    </Badge>
                  ) : null}
                </div>
                <DialogDescription>{getDescription()}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div
            className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5"
            onTouchStart={isAgendaReadOnly ? onTouchStart : undefined}
            onTouchMove={isAgendaReadOnly ? onTouchMove : undefined}
            onTouchEnd={isAgendaReadOnly ? onTouchEnd : undefined}
          >
            {canDragAppointments && !showVacantOnly && appointments.length > 0 ? (
              <div className="mb-4 space-y-3 rounded-xl border border-dashed border-border/80 bg-muted/20 p-3">
                <p className="text-xs font-medium text-foreground">
                  Arraste um card para reagendar
                </p>
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                    Outro dia
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {nearbyDateKeys.map((targetDate) => (
                      <AgendaDropZone
                        key={targetDate}
                        label={formatShortDate(targetDate)}
                        onDropAppointment={handleMoveToDate(targetDate)}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                    Outro profissional
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {professionals.map((professional) => (
                      <AgendaDropZone
                        key={professional.id}
                        label={professional.name}
                        description={professional.role ?? undefined}
                        onDropAppointment={handleMoveToProfessional(
                          professional.name
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {showVacantOnly ? (
              vacantSlots.length > 0 ? (
                <div className="space-y-3">
                  {vacantSlots.map((slot) => (
                    <VacantSlotCard
                      key={slot.id}
                      slot={slot}
                      isReadOnly={isAgendaReadOnly}
                      onSchedule={handleScheduleVacantSlot}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center">
                  <p className="text-sm font-medium text-foreground">
                    Nenhum horário vago
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Todos os horários deste dia já estão ocupados para o cargo
                    selecionado.
                  </p>
                </div>
              )
            ) : appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    isReadOnly={isAgendaReadOnly}
                    canDrag={canDragAppointments}
                    canViewDetails={canViewFinancialDetails}
                    onViewDetails={handleViewAppointmentDetails}
                    onStatusChange={handleStatusChange}
                    canCallPatient={canManageAgenda}
                    onCallPatient={handleOpenCallDialog}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center">
                <p className="text-sm font-medium text-foreground">
                  Dia livre na agenda
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Não há sessões marcadas para esta data.
                </p>
              </div>
            )}
          </div>

          {canManageAgenda ? (
            <div className="border-t border-border bg-muted/30 px-4 py-4 sm:px-6">
              <Button
                type="button"
                className="h-11 w-full"
                onClick={() => {
                  setAppointmentDefaults({
                    eventDate: dateKey ?? undefined,
                  });
                  setIsAppointmentDialogOpen(true);
                }}
              >
                <Plus className="size-4" aria-hidden />
                Novo agendamento
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AppointmentDetailDialog
        appointment={detailAppointment}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onAppointmentUpdate={handleAppointmentFinancialUpdate}
      />

      <NewAppointmentDialog
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
        defaults={appointmentDefaults}
        onCreated={(appointment) => {
          onAppointmentCreated?.(appointment);
          onRefreshAppointments?.();
        }}
      />

      <CallPatientDialog
        appointment={callAppointment}
        open={isCallDialogOpen}
        onOpenChange={setIsCallDialogOpen}
        onPatientCalled={handlePatientCalled}
      />

      {pendingUpdate ? (
        <AppointmentBulkStatusDialog
          open={isBulkDialogOpen}
          onOpenChange={handleBulkDialogOpenChange}
          patientName={pendingUpdate.patientName}
          status={pendingUpdate.status}
          affectedCount={pendingUpdate.affectedCount}
          onConfirm={handleBulkConfirm}
        />
      ) : null}
    </>
  );
}
