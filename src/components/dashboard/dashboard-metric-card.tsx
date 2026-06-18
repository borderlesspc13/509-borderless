import {
  Activity,
  ClipboardList,
  Clock,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const iconMap = {
  sessions: Activity,
  hours: Clock,
  programs: ClipboardList,
  avgPrograms: ThumbsUp,
  attempts: Activity,
  independence: ThumbsUp,
  learners: ClipboardList,
  attendance: Activity,
} as const;

const accentMap = {
  emerald: "border-t-emerald-500",
  sky: "border-t-sky-400",
  slate: "border-t-slate-600",
  muted: "border-t-muted-foreground/40",
  primary: "border-t-primary",
} as const;

type DashboardMetricCardProps = {
  label: string;
  value: string;
  icon: keyof typeof iconMap;
  accent?: keyof typeof accentMap;
  className?: string;
  compactValue?: boolean;
};

export function DashboardMetricCard({
  label,
  value,
  icon,
  accent = "primary",
  className,
  compactValue = false,
}: DashboardMetricCardProps) {
  const Icon: LucideIcon = iconMap[icon];

  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden border-border/70 border-t-4 shadow-sm",
        accentMap[accent],
        className
      )}
    >
      <CardContent className="flex flex-1 items-start justify-between gap-3 p-5 sm:p-6">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="min-h-10 text-sm font-medium leading-snug text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "font-semibold tracking-tight text-foreground",
              compactValue
                ? "text-lg leading-snug sm:text-xl"
                : "text-2xl sm:text-3xl"
            )}
          >
            {value}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
          <Icon className="size-5" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
