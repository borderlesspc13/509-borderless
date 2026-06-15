import {
  CheckCircle2,
  UserMinus,
  Users,
  UserX,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/app/actions/team-actions";

type ProfessionalStatsRowProps = {
  professionals: TeamMember[];
};

const statCards = [
  {
    key: "active",
    label: "Ativos",
    accent: "border-l-clinical-success",
    iconClass: "text-clinical-success",
    icon: CheckCircle2,
    getValue: (professionals: TeamMember[]) =>
      professionals.filter((professional) => professional.status === "active")
        .length,
  },
  {
    key: "inactive",
    label: "Inativos",
    accent: "border-l-destructive",
    iconClass: "text-destructive",
    icon: UserMinus,
    getValue: (professionals: TeamMember[]) =>
      professionals.filter((professional) => professional.status === "inactive")
        .length,
  },
  {
    key: "total",
    label: "Contratados",
    accent: "border-l-primary",
    iconClass: "text-primary",
    icon: Users,
    getValue: (professionals: TeamMember[]) => professionals.length,
  },
  {
    key: "supervisors",
    label: "Supervisores",
    accent: "border-l-emerald-500",
    iconClass: "text-emerald-600",
    icon: UserX,
    getValue: (professionals: TeamMember[]) =>
      professionals.filter(
        (professional) =>
          professional.profile === "SUPERVISOR" ||
          professional.profile === "ADMIN"
      ).length,
  },
] as const;

export function ProfessionalStatsRow({
  professionals,
}: ProfessionalStatsRowProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.key}
            className={cn(
              "overflow-hidden border-border/70 border-l-4 shadow-sm",
              stat.accent
            )}
          >
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {stat.getValue(professionals)}
                </p>
              </div>
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full bg-muted/50",
                  stat.iconClass
                )}
              >
                <Icon className="size-5" aria-hidden />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
