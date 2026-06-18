"use client";

import { useState } from "react";
import {
  ChevronDown,
  Clock,
  Eye,
  GripVertical,
  Lock,
  RefreshCw,
  UserRound,
} from "lucide-react";

import { AppointmentStatusBadge } from "@/components/dashboard/appointment-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTouchScrollGuard } from "@/hooks/use-touch-scroll-guard";
import { setDraggedAppointmentId } from "@/lib/appointment-move-utils";
import { cn } from "@/lib/utils";
import type {
  AppointmentStatus,
  DailyAppointment,
} from "@/lib/dashboard-mock-data";

const statusOptions: {
  value: AppointmentStatus;
  label: string;
  variant?: "destructive";
}[] = [
  { value: "agendado", label: "Agendado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "em_espera", label: "Em espera" },
  { value: "cancelado", label: "Cancelado", variant: "destructive" },
];

type AppointmentCardProps = {
  appointment: DailyAppointment;
  isReadOnly?: boolean;
  canDrag?: boolean;
  canViewDetails?: boolean;
  onViewDetails?: (appointment: DailyAppointment) => void;
  onStatusChange: (
    appointmentId: string,
    status: AppointmentStatus
  ) => void;
};

export function AppointmentCard({
  appointment,
  isReadOnly = false,
  canDrag = false,
  canViewDetails = false,
  onViewDetails,
  onStatusChange,
}: AppointmentCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { onTouchStart, onTouchMove, onTouchEnd, shouldBlockInteraction } =
    useTouchScrollGuard();

  const isWaiting = appointment.status === "em_espera";
  const isCancelled = appointment.status === "cancelado";
  const isDraggable = canDrag && !isReadOnly && !isCancelled;

  function handleDragStart(event: React.DragEvent<HTMLElement>) {
    if (!isDraggable) {
      event.preventDefault();
      return;
    }

    setDraggedAppointmentId(event.dataTransfer, appointment.id);
    setIsDragging(true);
  }

  function handleDragEnd() {
    setIsDragging(false);
  }

  function handleCardClick(event: React.MouseEvent<HTMLElement>) {
    if (isReadOnly && shouldBlockInteraction()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  return (
    <article
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
      onTouchStart={isReadOnly ? onTouchStart : undefined}
      onTouchMove={isReadOnly ? onTouchMove : undefined}
      onTouchEnd={isReadOnly ? onTouchEnd : undefined}
      className={cn(
        "app-surface-card flex w-full min-h-[5.5rem] flex-col gap-3 p-4 transition-all",
        isWaiting
          ? "border-clinical-warning/50 bg-clinical-warning/10 ring-1 ring-clinical-warning/25"
          : isCancelled
            ? "border-destructive/20 bg-destructive/5 opacity-80"
            : "border-border/80",
        isDraggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-primary/30",
        isReadOnly && "touch-pan-y select-none"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {isDraggable ? (
            <GripVertical
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          ) : isReadOnly ? (
            <Lock
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
          ) : null}

          <div
            className={cn(
              "flex shrink-0 flex-col items-center justify-center rounded-lg px-2.5 py-2 text-center",
              isWaiting
                ? "bg-clinical-warning/25"
                : isCancelled
                  ? "bg-destructive/10"
                  : "bg-primary/10"
            )}
          >
            <span
              className={cn(
                "text-sm font-bold leading-none",
                isWaiting
                  ? "text-[oklch(0.42_0.12_75)]"
                  : isCancelled
                    ? "text-destructive"
                    : "text-primary"
              )}
            >
              {appointment.time}
            </span>
            <span className="mt-1 text-[0.65rem] text-muted-foreground">
              {appointment.endTime}
            </span>
          </div>

          <div className="min-w-0 space-y-1">
            <p
              className={cn(
                "truncate text-base font-semibold text-foreground",
                isCancelled && "line-through decoration-destructive/50"
              )}
            >
              {appointment.patient}
            </p>
            <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
              <UserRound className="size-3.5 shrink-0" aria-hidden />
              {appointment.professional}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          <span>
            {appointment.time} – {appointment.endTime}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canViewDetails && onViewDetails ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => onViewDetails(appointment)}
            >
              <Eye className="size-3.5" aria-hidden />
              Detalhes
            </Button>
          ) : null}

          {isReadOnly ? (
            <span className="text-xs font-medium text-muted-foreground">
              Somente leitura
            </span>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 gap-1.5 text-xs"
                  />
                }
              >
                <RefreshCw className="size-3.5" aria-hidden />
                Atualizar situação
                <ChevronDown className="size-3 opacity-60" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Alterar para</DropdownMenuLabel>
                  {statusOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      variant={option.variant}
                      disabled={appointment.status === option.value}
                      onClick={() =>
                        onStatusChange(appointment.id, option.value)
                      }
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </article>
  );
}
