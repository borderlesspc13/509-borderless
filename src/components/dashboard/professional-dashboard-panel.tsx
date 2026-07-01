"use client";

import { useEffect, useState, useTransition } from "react";
import { Download } from "lucide-react";

import { getProfessionalDashboardDataAction } from "@/app/actions/dashboard-analytics-actions";
import { useAppToast } from "@/hooks/use-app-toast";
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
import { dashboardServiceTypes } from "@/lib/dashboard-analytics-types";
import type { ProfessionalMetric } from "@/lib/dashboard-analytics-types";
import { cn } from "@/lib/utils";

const filterFieldClassName = "min-w-0 space-y-2";
const filterControlClassName = "!h-11 w-full min-w-0";

const serviceTypeItems = dashboardServiceTypes.map((type) => ({
  label: type.label,
  value: type.id,
}));

const emptyMetrics: ProfessionalMetric[] = [
  {
    label: "Sessões Realizadas",
    value: "0",
    icon: "sessions",
    accent: "emerald",
  },
  {
    label: "Horas de Atendimento",
    value: "0 minutos",
    icon: "hours",
    accent: "sky",
  },
  {
    label: "Aprendizes Atendidos",
    value: "0",
    icon: "programs",
    accent: "slate",
  },
  {
    label: "Média Aprendizes/Sessão",
    value: "0",
    icon: "avgPrograms",
    accent: "muted",
  },
];

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
  const [professionalUserId, setProfessionalUserId] = useState("all");
  const [professionals, setProfessionals] = useState([
    { id: "all", label: "Todos os profissionais" },
  ]);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [sessionsByLearner, setSessionsByLearner] = useState<
    Array<{ learner: string; sessions: number }>
  >([]);
  const [sessionsByWeek, setSessionsByWeek] = useState<
    Array<{ weekLabel: string; sessions: number }>
  >([]);
  const toast = useAppToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getProfessionalDashboardDataAction({
        startDate,
        endDate,
        professionalUserId,
      });

      if (!result.success) {
        setError(result.error);
        toast.error({
          title: "Falha ao carregar",
          description:
            result.error ?? "Não foi possível carregar os relatórios clínicos.",
        });
        return;
      }

      setError(null);
      setProfessionals(result.data.professionals);
      setMetrics(result.data.metrics);
      setSessionsByLearner(result.data.sessionsByLearner);
      setSessionsByWeek(result.data.sessionsByWeek);
    });
  }, [startDate, endDate, professionalUserId]);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:items-end xl:grid-cols-5">
          <div className={cn(filterFieldClassName, "xl:col-span-2")}>
            <Label htmlFor="dashboard-professional">Profissional</Label>
            <Select
              value={professionalUserId}
              items={professionals.map((professional) => ({
                label: professional.label,
                value: professional.id,
              }))}
              onValueChange={(value) => setProfessionalUserId(value as string)}
            >
              <SelectTrigger
                id="dashboard-professional"
                className={filterControlClassName}
              >
                <SelectValue placeholder="Busque pelo profissional..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {professionals.map((professional) => (
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

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando indicadores...</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
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
            sessions: sessionsByLearner.map((item) => ({
              label: item.learner,
              value: item.sessions,
            })),
            hours: sessionsByLearner.map((item) => ({
              label: item.learner,
              value: item.sessions,
            })),
            stats: sessionsByLearner.map((item) => ({
              label: item.learner,
              value: item.sessions,
            })),
          }}
          variant="horizontal"
          footnotes={["* Dados consolidados a partir da agenda no Supabase."]}
        />

        <DashboardChartPanel
          title="Total de Sessões (Por Semana)"
          tabs={[
            { value: "sessions", label: "Sessões por semana" },
            { value: "minutes", label: "Minutos por semana" },
            { value: "stats", label: "Estatísticas" },
          ]}
          dataByTab={{
            sessions: sessionsByWeek.map((item) => ({
              label: item.weekLabel,
              value: item.sessions,
            })),
            minutes: sessionsByWeek.map((item) => ({
              label: item.weekLabel,
              value: item.sessions,
            })),
            stats: sessionsByWeek.map((item) => ({
              label: item.weekLabel,
              value: item.sessions,
            })),
          }}
          variant="vertical"
          barClassName="bg-sky-400"
          footnotes={[
            "* A semana inicia no domingo e termina no sábado.",
            "* Dados consolidados a partir da agenda no Supabase.",
          ]}
        />
      </div>
    </div>
  );
}
