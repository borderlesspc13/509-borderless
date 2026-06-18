"use client";

import { Download } from "lucide-react";

import { DashboardChartPanel } from "@/components/dashboard/dashboard-chart-panel";
import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  dashboardProfessionals,
  dashboardServiceTypes,
  professionalDashboardMetrics,
  sessionsByLearnerData,
  sessionsByWeekData,
} from "@/lib/dashboard-analytics-data";
import { cn } from "@/lib/utils";

const filterFieldClassName = "min-w-0 space-y-2";
const filterControlClassName = "!h-11 w-full min-w-0";

const professionalSelectItems = dashboardProfessionals.map((professional) => ({
  label: professional.label,
  value: professional.id,
}));

const serviceTypeItems = dashboardServiceTypes.map((type) => ({
  label: type.label,
  value: type.id,
}));

type ProfessionalDashboardPanelProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

export function ProfessionalDashboardPanel({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ProfessionalDashboardPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:items-end xl:grid-cols-5">
          <div className={cn(filterFieldClassName, "xl:col-span-2")}>
            <Label htmlFor="dashboard-professional">Profissional</Label>
            <Select
              defaultValue="all"
              items={professionalSelectItems}
            >
              <SelectTrigger
                id="dashboard-professional"
                className={filterControlClassName}
              >
                <SelectValue placeholder="Busque pelo profissional..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {dashboardProfessionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className={filterFieldClassName}>
            <Label htmlFor="professional-start-date">
              Data início <span className="text-destructive">*</span>
            </Label>
            <Input
              id="professional-start-date"
              type="date"
              value={startDate}
              onChange={(event) => onStartDateChange(event.target.value)}
              className={filterControlClassName}
            />
          </div>

          <div className={filterFieldClassName}>
            <Label htmlFor="professional-end-date">
              Data fim <span className="text-destructive">*</span>
            </Label>
            <Input
              id="professional-end-date"
              type="date"
              value={endDate}
              onChange={(event) => onEndDateChange(event.target.value)}
              className={filterControlClassName}
            />
          </div>

          <div className={filterFieldClassName}>
            <Label htmlFor="dashboard-service-type">Tipo Atendimento</Label>
            <Select defaultValue="sessao" items={serviceTypeItems}>
              <SelectTrigger
                id="dashboard-service-type"
                className={filterControlClassName}
              >
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {dashboardServiceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className={cn(filterFieldClassName, "sm:col-span-2 xl:col-span-1")}>
            <Label className="sr-only">Exportar relatório</Label>
            <Button type="button" className="h-11 w-full gap-2">
              <Download className="size-4" aria-hidden />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {professionalDashboardMetrics.map((metric) => (
          <DashboardMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            accent={metric.accent}
            compactValue={metric.icon === "hours"}
          />
        ))}
      </div>

      <div className="grid items-stretch gap-5 xl:grid-cols-2">
        <DashboardChartPanel
          title="Sessões Realizadas por Aprendiz"
          tabs={[
            { value: "sessions", label: "Sessões por aprendiz" },
            { value: "hours", label: "Horas por aprendiz" },
            { value: "stats", label: "Estatísticas" },
          ]}
          dataByTab={{
            sessions: sessionsByLearnerData.map((item) => ({
              label: item.learner,
              value: item.sessions,
            })),
            hours: sessionsByLearnerData.map((item) => ({
              label: item.learner,
              value: 1,
            })),
            stats: sessionsByLearnerData.map((item) => ({
              label: item.learner,
              value: item.sessions,
            })),
          }}
          variant="horizontal"
          footnotes={["* Este gráfico analisa apenas horas completas."]}
        />

        <DashboardChartPanel
          title="Total de Sessões (Por Semana)"
          tabs={[
            { value: "sessions", label: "Sessões por semana" },
            { value: "minutes", label: "Minutos por semana" },
            { value: "stats", label: "Estatísticas" },
          ]}
          dataByTab={{
            sessions: sessionsByWeekData.map((item) => ({
              label: item.weekLabel,
              value: item.sessions,
            })),
            minutes: sessionsByWeekData.map((item) => ({
              label: item.weekLabel,
              value: 1,
            })),
            stats: sessionsByWeekData.map((item) => ({
              label: item.weekLabel,
              value: item.sessions,
            })),
          }}
          variant="vertical"
          barClassName="bg-sky-400"
          footnotes={[
            "* A semana inicia no domingo e termina no sábado.",
            "* Este gráfico analisa apenas horas completas.",
          ]}
        />
      </div>
    </div>
  );
}
