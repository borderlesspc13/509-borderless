import {
  CheckCircle2,
  ClipboardList,
  UserMinus,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PatientRow } from "@/lib/supabase/database.types";

type PatientStatsRowProps = {
  patients: PatientRow[];
};

const statCards = [
  {
    key: "active",
    label: "Ativos",
    accent: "border-l-clinical-success",
    iconClass: "text-clinical-success",
    icon: CheckCircle2,
    getValue: (patients: PatientRow[]) =>
      patients.filter((patient) => patient.status === "active").length,
  },
  {
    key: "inactive",
    label: "Inativos",
    accent: "border-l-destructive",
    iconClass: "text-destructive",
    icon: UserMinus,
    getValue: (patients: PatientRow[]) =>
      patients.filter((patient) => patient.status === "inactive").length,
  },
  {
    key: "total",
    label: "Contratados",
    accent: "border-l-primary",
    iconClass: "text-primary",
    icon: Users,
    getValue: (patients: PatientRow[]) => patients.length,
  },
  {
    key: "discharged",
    label: "Alta",
    accent: "border-l-emerald-500",
    iconClass: "text-emerald-600",
    icon: ClipboardList,
    getValue: (patients: PatientRow[]) =>
      patients.filter((patient) => patient.status === "discharged").length,
  },
] as const;

export function PatientStatsRow({ patients }: PatientStatsRowProps) {
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
                  {stat.getValue(patients)}
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
