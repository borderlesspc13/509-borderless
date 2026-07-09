"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Brain } from "lucide-react";

import { getAiReportTrainingDashboardAction } from "@/app/actions/ai-report-training-actions";
import { AiWritingTrainingWidget } from "@/components/ai-writing-training/ai-writing-training-widget";
import { useAppToast } from "@/hooks/use-app-toast";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AI_REPORT_TRAINING_STATUS_LABELS,
  groupAiWritingTrainingContexts,
  type AiWritingTrainingContext,
} from "@/lib/ai-report-training/constants";
import type { AiReportAreaTrainingState } from "@/lib/ai-report-training/types";
import { cn } from "@/lib/utils";

const statusBadgeClass: Record<string, string> = {
  not_started: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  collecting: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  ready: "border-clinical-success/30 bg-clinical-success/10 text-clinical-success",
  stale: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function AiReportTrainingPanel() {
  const toast = useAppToast();
  const [areas, setAreas] = useState<AiReportAreaTrainingState[]>([]);
  const [mockMode, setMockMode] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isLoading, startLoadTransition] = useTransition();

  const loadDashboard = useCallback(() => {
    startLoadTransition(async () => {
      const result = await getAiReportTrainingDashboardAction();
      if (!result.success || !result.data) {
        toast.error({
          title: "Falha ao carregar",
          description: result.error,
        });
        return;
      }
      setAreas(result.data.areas);
      setMockMode(result.data.mockMode);
      setSelectedKey((current) => current ?? result.data?.areas[0]?.trainingContextKey ?? null);
    });
  }, [toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const grouped = groupAiWritingTrainingContexts();
  const areaByKey = new Map(areas.map((area) => [area.trainingContextKey, area]));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5 text-primary" aria-hidden />
            Central de treinamento IA
          </CardTitle>
          <CardDescription>
            Cada área clínica, avaliação e tipo de relatório possui memória
            separada. Salve 5 documentos, treine e gere novos com o mesmo padrão.
            {mockMode ? (
              <Badge variant="outline" className="ml-2">
                Modo demonstração — aguardando OPENAI_API_KEY
              </Badge>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : null}

          {grouped.map(
            ({
              group,
              contexts,
            }: {
              group: string;
              contexts: AiWritingTrainingContext[];
            }) => (
            <div key={group} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group}
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {contexts.map((context: AiWritingTrainingContext) => {
                  const state = areaByKey.get(context.key);
                  const status = state?.memory.status ?? "not_started";
                  const sampleCount = state?.samples.length ?? 0;

                  return (
                    <button
                      key={context.key}
                      type="button"
                      onClick={() => setSelectedKey(context.key)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        selectedKey === context.key
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/70 bg-muted/10 hover:bg-muted/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{context.label}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 text-[0.6rem]",
                            statusBadgeClass[status]
                          )}
                        >
                          {AI_REPORT_TRAINING_STATUS_LABELS[status]}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {sampleCount}/5 amostras
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedKey ? (
        <AiWritingTrainingWidget
          key={selectedKey}
          trainingContextKey={selectedKey}
          defaultExpanded
        />
      ) : null}
    </div>
  );
}
