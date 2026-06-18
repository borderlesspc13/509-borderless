"use client";

import { useState } from "react";

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
import {
  bottomProgramsData,
  dashboardCurriculumFolders,
  dashboardLearners,
  learnerDashboardMetrics,
  skillPerformanceData,
  topProgramsData,
} from "@/lib/dashboard-analytics-data";

const learnerSelectItems = dashboardLearners.map((learner) => ({
  label: learner.label,
  value: learner.id,
}));

const folderSelectItems = dashboardCurriculumFolders.map((folder) => ({
  label: folder.label,
  value: folder.id,
}));

const filterFieldClassName = "min-w-0 space-y-2";
const filterControlClassName = "!h-11 w-full min-w-0";

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

  const programData = programRanking === "top" ? topProgramsData : bottomProgramsData;

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:items-end xl:grid-cols-4">
          <div className={filterFieldClassName}>
            <Label htmlFor="dashboard-learner">Aprendiz</Label>
            <Select
              value={learnerId}
              items={learnerSelectItems}
              onValueChange={(value) => setLearnerId(value as string)}
            >
              <SelectTrigger id="dashboard-learner" className={filterControlClassName}>
                <SelectValue placeholder="Selecione o aprendiz" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {dashboardLearners.map((learner) => (
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
              items={folderSelectItems}
              onValueChange={(value) => setFolderId(value as string)}
            >
              <SelectTrigger id="dashboard-folder" className={filterControlClassName}>
                <SelectValue placeholder="Selecione a pasta" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {dashboardCurriculumFolders.map((folder) => (
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {learnerDashboardMetrics.map((metric, index) => (
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
            <CardTitle>Desempenho por Habilidade</CardTitle>
            <CardDescription>
              Indicadores de progresso por área curricular no período
              selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center py-6">
            <DashboardBarChart
              variant="vertical"
              items={skillPerformanceData.map((item) => ({
                label: item.skill.split(" ")[0],
                value: item.score,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col shadow-sm">
          <CardHeader className="space-y-4 border-b border-border/60 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-1">
                <CardTitle>Programas com Maior Desempenho</CardTitle>
                <CardDescription>
                  Ranking de programas ABA no intervalo filtrado.
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
                  + 10 maior desempenho
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 whitespace-nowrap"
                  variant={programRanking === "bottom" ? "default" : "outline"}
                  onClick={() => setProgramRanking("bottom")}
                >
                  + 10 menor desempenho
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 py-6">
            <DashboardBarChart
              items={programData.map((item) => ({
                label: item.program,
                value: item.score,
              }))}
              valueSuffix="%"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
