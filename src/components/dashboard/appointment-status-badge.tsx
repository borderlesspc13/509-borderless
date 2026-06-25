import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/agenda-types";

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  confirmado: {
    label: "Confirmado",
    className:
      "border-clinical-success/20 bg-clinical-success/10 text-[oklch(0.42_0.1_155)]",
  },
  agendado: {
    label: "Agendado",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  em_espera: {
    label: "Em espera",
    className:
      "border-clinical-warning/30 bg-clinical-warning/20 font-semibold text-[oklch(0.45_0.12_75)]",
  },
  chamado: {
    label: "Chamado",
    className:
      "border-primary/30 bg-primary/15 font-semibold text-primary",
  },
  cancelado: {
    label: "Cancelado",
    className:
      "border-destructive/20 bg-destructive/10 text-destructive line-through decoration-destructive/60",
  },
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
  className?: string;
};

export function AppointmentStatusBadge({
  status,
  className,
}: AppointmentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("h-6 px-2.5 text-xs", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
