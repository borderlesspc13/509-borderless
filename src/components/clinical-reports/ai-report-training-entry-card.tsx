"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brain, Sparkles } from "lucide-react";

import { getAiReportTrainingDashboardAction } from "@/app/actions/ai-report-training-actions";
import { AiReportGeneratorDialog } from "@/components/clinical-reports/ai-report-generator-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AiReportTrainingEntryCard() {
  const [readyCount, setReadyCount] = useState(0);
  const [trainedContexts, setTrainedContexts] = useState<
    { trainingContextKey: string; contextLabel: string; isReady: boolean }[]
  >([]);
  const [generatorOpen, setGeneratorOpen] = useState(false);

  useEffect(() => {
    void getAiReportTrainingDashboardAction().then((result) => {
      if (!result.success || !result.data) {
        return;
      }
      const ready = result.data.areas.filter((area) => area.isReady);
      setReadyCount(ready.length);
      setTrainedContexts(
        result.data.areas.map((area) => ({
          trainingContextKey: area.trainingContextKey,
          contextLabel: area.contextLabel,
          isReady: area.isReady,
        }))
      );
    });
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="size-5 text-primary" aria-hidden />
            IA em relatórios e avaliações
          </CardTitle>
          <CardDescription>
            Todas as áreas clínicas, avaliações (PEDI, EBAI, Perfil Sensorial)
            e tipos de relatório seguem o mesmo fluxo: 5 documentos manuais →
            treinar → gerar com IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/relatorios/treinamento-ia" />}
          >
            Central de treinamento IA
          </Button>
          {readyCount > 0 ? (
            <Button
              type="button"
              className="gap-2"
              onClick={() => setGeneratorOpen(true)}
            >
              <Sparkles className="size-4" aria-hidden />
              Gerar Relatório com IA
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <AiReportGeneratorDialog
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
        trainedContexts={trainedContexts}
      />
    </>
  );
}
