"use client";

import { useEffect, useState, useTransition } from "react";

import { getLearnerDashboardDataAction } from "@/app/actions/dashboard-analytics-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { DashboardBarChart } from "@/components/dashboard/dashboard-bar-chart";
import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import type {
  DashboardMetric,
  ProgramPerformance,
  SkillPerformance,
} from "@/lib/dashboard-analytics-types";

const filterFieldClassName = "min-w-0 space-y-2";
const filterControlClassName = "!h-11 w-full min-w-0";

const emptyMetrics: DashboardMetric[] = [
  { label: "Sessões Atendidas", value: "0", icon: "sessions" },
  { label: "Evoluções Registradas", value: "0", icon: "programs" },
  { label: "Avaliações no Período", value: "0", icon: "attempts" },
  { label: "Média de Duração/Sessão", value: "0 min", icon: "independence" },
];

type LearnerDashboardPanelProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

export function LearnerDashboardPanel({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: LearnerDashboardPanelProps) {
  const [learnerId, setLearnerId] = useState("all");
  const [folderId, setFolderId] = useState("all");
  const [programRanking, setProgramRanking] = useState<"top" | "bottom">("top");
  const [learners, setLearners] = useState([{ id: "all", label: "Todos os aprendizes" }]);
  const [folders, setFolders] = useState([{ id: "all", label: "Todas as pastas" }]);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [skillPerformance, setSkillPerformance] = useState<SkillPerformance[]>([]);
  const [topPrograms, setTopPrograms] = useState<ProgramPerformance[]>([]);
  const [bottomPrograms, setBottomPrograms] = useState<ProgramPerformance[]>([]);
  const toast = useAppToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getLearnerDashboardDataAction({
        startDate,
        endDate,
        learnerId,
        folderId,
      });

      if (!result.success) {
        setError(result.error);
        toast.error({
          title: "Falha ao carregar",
          description:
            result.error ?? "Não foi possível carregar os indicadores.",
        });
        return;
      }

      setError(null);
      setLearners(result.data.learners);
      setFolders(result.data.folders);
      setMetrics(result.data.metrics);
      setSkillPerformance(result.data.skillPerformance);
      setTopPrograms(result.data.topPrograms);
      setBottomPrograms(result.data.bottomPrograms);
    });
  }, [startDate, endDate, learnerId, folderId]);

  const programData = programRanking === "top" ? topPrograms : bottomPrograms;

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:items-end xl:grid-cols-4">
          <div className={filterFieldClassName}>
            <Label htmlFor="dashboard-learner">Aprendiz</Label>
            <Select
              value={learnerId}
              items={learners.map((learner) => ({
                label: learner.label,
                value: learner.id,
              }))}
              onValueChange={(value) => setLearnerId(value as string)}
            >
              <SelectTrigger id="dashboard-learner" className={filterControlClassName}>
                <SelectValue placeholder="Selecione o aprendiz" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {learners.map((learner) => (
                    <SelectItem key={learner.id} value={learner.id}>
                      {learner.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className={filterFieldClassName}>
            <Label htmlFor="dashboard-folder">Pasta Curricular</Label>
            <Select
              value={folderId}
              items={folders.map((folder) => ({
                label: folder.label,
                value: folder.id,
              }))}
              onValueChange={(value) => setFolderId(value as string)}
            >
              <SelectTrigger id="dashboard-folder" className={filterControlClassName}>
                <SelectValue placeholder="Selecione a pasta" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className={filterFieldClassName}>
            <Label htmlFor="learner-start-date">Data início</Label>
            <Input
              id="learner-start-date"
              type="date"
              value={startDate}
              onChange={(event) => onStartDateChange(event.target.value)}
              className={filterControlClassName}
            />
          </div>

          <div className={filterFieldClassName}>
            <Label htmlFor="learner-end-date">Data fim</Label>
            <Input
              id="learner-end-date"
              type="date"
              value={endDate}
              onChange={(event) => onEndDateChange(event.target.value)}
              className={filterControlClassName}
            />
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
        {metrics.map((metric, index) => (
          <DashboardMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            accent={
              (["primary", "primary", "primary", "primary"] as const)[index] ??
              "primary"
            }
          />
        ))}
      </div>

      <div className="grid items-stretch gap-5 xl:grid-cols-2">
        <Card className="flex h-full flex-col shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>
              {folderId === "all"
                ? "Sessões por Profissional"
                : "Desempenho por Habilidade"}
            </CardTitle>
            <CardDescription>
              {folderId === "all"
                ? "Distribuição de sessões da agenda no período selecionado."
                : "Pontuações do instrumento selecionado no Supabase."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center py-6">
            {skillPerformance.length > 0 ? (
              <DashboardBarChart
                variant="vertical"
                items={skillPerformance.map((item) => ({
                  label: item.skill.split(" ")[0],
                  value: item.score,
                }))}
              />
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Nenhum dado disponível para o filtro atual.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col shadow-sm">
          <CardHeader className="space-y-4 border-b border-border/60 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-1">
                <CardTitle>Instrumentos de Avaliação</CardTitle>
                <CardDescription>
                  Frequência de avaliações registradas no período filtrado.
                </CardDescription>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 whitespace-nowrap"
                  variant={programRanking === "top" ? "default" : "outline"}
                  onClick={() => setProgramRanking("top")}
                >
                  + 10 mais frequentes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 whitespace-nowrap"
                  variant={programRanking === "bottom" ? "default" : "outline"}
                  onClick={() => setProgramRanking("bottom")}
                >
                  + 10 menos frequentes
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 py-6">
            {programData.length > 0 ? (
              <DashboardBarChart
                items={programData.map((item) => ({
                  label: item.program,
                  value: item.score,
                }))}
              />
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Nenhuma avaliação encontrada no período.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
