import {
  CalendarClock,
  CircleCheck,
  CircleX,
  Megaphone,
  Hourglass,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/agenda-types";

const statusIconConfig: Record<
  AppointmentStatus,
  { icon: LucideIcon; className: string; label: string }
> = {
  confirmado: {
    icon: CircleCheck,
    className: "text-clinical-success",
    label: "Confirmado",
  },
  agendado: {
    icon: CalendarClock,
    className: "text-primary",
    label: "Agendado",
  },
  em_espera: {
    icon: Hourglass,
    className: "text-[oklch(0.48_0.12_75)]",
    label: "Em espera",
  },
  chamado: {
    icon: Megaphone,
    className: "text-primary",
    label: "Chamado",
  },
  cancelado: {
    icon: CircleX,
    className: "text-destructive",
    label: "Cancelado",
  },
};

type AppointmentDayIconProps = {
  status: AppointmentStatus;
  className?: string;
};

export function AppointmentDayIcon({
  status,
  className,
}: AppointmentDayIconProps) {
  const config = statusIconConfig[status];
  const Icon = config.icon;

  return (
    <span
      title={config.label}
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-full bg-background/80 sm:size-6",
        className
      )}
    >
      <Icon className={cn("size-3 sm:size-3.5", config.className)} aria-hidden />
      <span className="sr-only">{config.label}</span>
    </span>
  );
}
