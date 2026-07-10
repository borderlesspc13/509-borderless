"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

import { AgendaToolbar } from "@/components/dashboard/agenda-toolbar";
import { Badge } from "@/components/ui/badge";
import { useAppToast } from "@/hooks/use-app-toast";
import { useAgendaAudit } from "@/hooks/use-agenda-audit";
import { useAgendaEvents } from "@/hooks/use-agenda-events";
import { useAgendaProfessionals } from "@/hooks/use-agenda-professionals";
import { useUserRole } from "@/hooks/use-user-role";
import { buildDateMoveLog } from "@/lib/audit-log";
import { moveAppointmentToDate, parseDraggedAppointmentId } from "@/lib/appointment-move-utils";
import { AppointmentDayIcon } from "@/components/dashboard/appointment-day-icon";
import { DayAppointmentsDialog } from "@/components/dashboard/day-appointments-dialog";
import {
  NewAppointmentDialog,
  type NewAppointmentDefaults,
} from "@/components/dashboard/new-appointment-dialog";
import { Button } from "@/components/ui/button";
import {
  collectAgendaLocations,
  countVacantSlotsForDate,
  DEFAULT_AGENDA_FILTERS,
  filterAppointmentsByAgendaFilters,
  type AgendaFilters as AgendaFiltersState,
} from "@/lib/agenda-filter-utils";
import {
  EMPTY_AGENDA_PERSON_FILTERS,
  filterAppointmentsByPersonFilters,
  type AgendaPersonFilters,
} from "@/lib/agenda-individual-filter";
import type { DailyAppointment } from "@/lib/agenda-types";
import {
  formatMonthYear,
  getCalendarDays,
  getWeekdayLabels,
  toDateKey,
} from "@/lib/calendar-utils";
import type { CareType } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type AgendaCalendarProps = {
  careType?: CareType;
};

export function AgendaCalendar({ careType = "ABA" }: AgendaCalendarProps) {
  const { isAgendaReadOnly, canDragAppointments, canManageAgenda } =
    useUserRole();
  const { recordAuditLogs } = useAgendaAudit();
  const toast = useAppToast();
  const {
    appointments,
    setAppointments,
    isLoading,
    addAppointment,
    refetch,
  } = useAgendaEvents(careType);
  const { professionals, isLoading: isProfessionalsLoading } =
    useAgendaProfessionals();
  const today = new Date();
  const [dragOverDateKey, setDragOverDateKey] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [personFilters, setPersonFilters] = useState<AgendaPersonFilters>(
    EMPTY_AGENDA_PERSON_FILTERS
  );
  const [filters, setFilters] =
    useState<AgendaFiltersState>(DEFAULT_AGENDA_FILTERS);
  const [appointmentDefaults, setAppointmentDefaults] =
    useState<NewAppointmentDefaults | null>(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);

  const scopedProfessionals = useMemo(() => {
    if (personFilters.professional) {
      return professionals.filter(
        (professional) => professional.id === personFilters.professional?.id
      );
    }

    return professionals;
  }, [personFilters.professional, professionals]);

  const locations = useMemo(
    () => collectAgendaLocations(appointments),
    [appointments]
  );

  const visibleAppointments = useMemo(() => {
    const byPerson = filterAppointmentsByPersonFilters(
      appointments,
      personFilters
    );

    return filterAppointmentsByAgendaFilters(
      byPerson,
      filters,
      scopedProfessionals
    );
  }, [appointments, personFilters, filters, scopedProfessionals]);

  const calendarDays = useMemo(
    () =>
      getCalendarDays(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth]
  );

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, DailyAppointment[]>();

    visibleAppointments.forEach((appointment) => {
      const existing = map.get(appointment.date) ?? [];
      map.set(appointment.date, [...existing, appointment]);
    });

    map.forEach((dayAppointments, dateKey) => {
      map.set(
        dateKey,
        dayAppointments.sort((a, b) => a.time.localeCompare(b.time))
      );
    });

    return map;
  }, [visibleAppointments]);

  const selectedAppointments = selectedDateKey
    ? appointmentsByDate.get(selectedDateKey) ?? []
    : [];

  const showVacantOnly = filters.availability === "vacant";

  const hasPersonFilter = Boolean(
    personFilters.patient || personFilters.professional
  );

  function openDay(dateKey: string) {
    setSelectedDateKey(dateKey);
    setIsDialogOpen(true);
  }

  function goToPreviousMonth() {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  }

  function goToToday() {
    const currentToday = new Date();
    setVisibleMonth(
      new Date(currentToday.getFullYear(), currentToday.getMonth(), 1)
    );
    openDay(toDateKey(currentToday));
  }

  function handleDayDragOver(
    event: React.DragEvent<HTMLButtonElement>,
    dateKey: string
  ) {
    if (!canDragAppointments) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverDateKey(dateKey);
  }

  function handleDayDragLeave() {
    setDragOverDateKey(null);
  }

  function handleDayDrop(
    event: React.DragEvent<HTMLButtonElement>,
    dateKey: string
  ) {
    if (!canDragAppointments) {
      return;
    }

    event.preventDefault();
    setDragOverDateKey(null);

    const appointmentId = parseDraggedAppointmentId(event.dataTransfer);

    if (!appointmentId) {
      return;
    }

    const appointment = appointments.find((item) => item.id === appointmentId);

    if (!appointment || appointment.date === dateKey) {
      return;
    }

    const nextAppointments = moveAppointmentToDate(
      appointments,
      appointmentId,
      dateKey
    );

    setAppointments(nextAppointments);
    void recordAuditLogs([buildDateMoveLog(appointment, dateKey)]);
    toast.success({
      title: "Agendamento movido",
      description: `Sessão de ${appointment.patient} transferida para outra data.`,
    });
  }

  return (
    <div className="space-y-3">
      <AgendaToolbar
        personFilters={personFilters}
        onPersonFiltersChange={setPersonFilters}
        filters={filters}
        onFiltersChange={setFilters}
        locations={locations}
        canCreateAppointment={canManageAgenda}
        onCreateAppointment={() => {
          setAppointmentDefaults({
            eventDate: selectedDateKey ?? toDateKey(today),
          });
          setIsAppointmentDialogOpen(true);
        }}
      />

      {(hasPersonFilter || isAgendaReadOnly) && (
        <div className="flex flex-wrap items-center gap-2 px-0.5">
          {personFilters.patient ? (
            <Badge variant="secondary" className="h-6 gap-1 text-xs">
              Aprendiz: {personFilters.patient.name}
            </Badge>
          ) : null}
          {personFilters.professional ? (
            <Badge variant="secondary" className="h-6 gap-1 text-xs">
              Profissional: {personFilters.professional.name}
            </Badge>
          ) : null}
          {isAgendaReadOnly ? (
            <Badge
              variant="outline"
              className="h-6 gap-1 border-muted-foreground/30 text-xs text-muted-foreground"
            >
              <Eye className="size-3" aria-hidden />
              Somente leitura
            </Badge>
          ) : null}
        </div>
      )}

      {isLoading || isProfessionalsLoading ? (
        <p className="text-sm text-muted-foreground">Carregando agenda...</p>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={goToPreviousMonth}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={goToNextMonth}
              aria-label="Próximo mês"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <h2 className="min-w-0 flex-1 text-center text-sm font-semibold capitalize sm:text-base">
            {formatMonthYear(visibleMonth)}
          </h2>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0"
            onClick={goToToday}
          >
            Hoje
          </Button>
        </div>

        <div className="grid grid-cols-7 border-b border-border bg-muted/40">
          {getWeekdayLabels().map((label) => (
            <div
              key={label}
              className="px-1 py-2 text-center text-[0.65rem] font-medium text-muted-foreground sm:px-2 sm:text-xs"
            >
              <span className="sm:hidden">{label.charAt(0)}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dayAppointments = appointmentsByDate.get(day.dateKey) ?? [];
            const vacantCount = countVacantSlotsForDate(
              day.dateKey,
              appointments,
              filters,
              scopedProfessionals
            );
            const previewAppointments = dayAppointments.slice(0, 3);
            const hiddenCount =
              dayAppointments.length - previewAppointments.length;
            const hasAppointments = dayAppointments.length > 0;
            const hasVacantSlots = vacantCount > 0;

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => openDay(day.dateKey)}
                onDragOver={(event) => handleDayDragOver(event, day.dateKey)}
                onDragLeave={handleDayDragLeave}
                onDrop={(event) => handleDayDrop(event, day.dateKey)}
                className={cn(
                  "relative flex min-h-16 flex-col border-b border-r border-border/70 p-1.5 text-left transition-colors sm:min-h-24 sm:p-2",
                  "hover:bg-muted/50 active:bg-muted/70",
                  "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none",
                  !day.isCurrentMonth && "bg-muted/20 text-muted-foreground",
                  day.isToday && "bg-primary/5",
                  showVacantOnly &&
                    hasVacantSlots &&
                    "bg-clinical-success/5 ring-1 ring-inset ring-clinical-success/20",
                  canDragAppointments &&
                    dragOverDateKey === day.dateKey &&
                    "bg-primary/10 ring-2 ring-inset ring-primary/30"
                )}
                aria-label={
                  showVacantOnly
                    ? `${day.dayNumber}, ${vacantCount} horário${vacantCount !== 1 ? "s" : ""} vago${vacantCount !== 1 ? "s" : ""}`
                    : `${day.dayNumber}, ${dayAppointments.length} atendimentos`
                }
              >
                <span
                  className={cn(
                    "mb-1 inline-flex size-6 items-center justify-center self-end rounded-full text-xs font-medium sm:size-7 sm:text-sm",
                    day.isToday &&
                      "bg-primary text-primary-foreground font-semibold"
                  )}
                >
                  {day.dayNumber}
                </span>

                {showVacantOnly ? (
                  hasVacantSlots ? (
                    <div className="mt-auto flex items-center justify-end">
                      <span className="rounded-full bg-clinical-success/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-[oklch(0.42_0.1_155)] sm:text-[0.65rem]">
                        {vacantCount} vago{vacantCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ) : null
                ) : hasAppointments ? (
                  <div className="mt-auto flex flex-wrap items-center gap-0.5 sm:gap-1">
                    {previewAppointments.map((appointment) => (
                      <AppointmentDayIcon
                        key={appointment.id}
                        status={appointment.status}
                      />
                    ))}
                    {hiddenCount > 0 ? (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium text-muted-foreground sm:text-[0.65rem]">
                        +{hiddenCount}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:text-sm">
        <span className="font-medium text-foreground">Legenda:</span>
        <span className="inline-flex items-center gap-1.5">
          <AppointmentDayIcon status="confirmado" />
          Confirmado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <AppointmentDayIcon status="agendado" />
          Agendado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <AppointmentDayIcon status="em_espera" />
          Em espera
        </span>
        <span className="inline-flex items-center gap-1.5">
          <AppointmentDayIcon status="cancelado" />
          Cancelado
        </span>
      </div>

      <DayAppointmentsDialog
        dateKey={selectedDateKey}
        appointments={selectedAppointments}
        allAppointments={appointments}
        filters={filters}
        professionals={scopedProfessionals}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAppointmentsChange={setAppointments}
        onAppointmentCreated={addAppointment}
        onRefreshAppointments={refetch}
      />

      <NewAppointmentDialog
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
        defaults={appointmentDefaults}
        careType={careType}
        onCreated={(appointment) => {
          addAppointment(appointment);
          void refetch();
        }}
      />
    </div>
  );
}
