"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Calculator,
  Loader2,
  Printer,
  Save,
  ArrowLeft,
} from "lucide-react";

import {
  calculatePediScoreAction,
  savePediEvaluationAction,
} from "@/app/actions/pedi-actions";
import { PediAnswerGrid } from "@/components/assessments/pedi/pedi-answer-grid";
import { PediItemMap } from "@/components/assessments/pedi/pedi-item-map";
import { PediScoreResults } from "@/components/assessments/pedi/pedi-score-results";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
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
import { useAppToast } from "@/hooks/use-app-toast";
import { useUserRole } from "@/hooks/use-user-role";
import { toDateKey } from "@/lib/calendar-utils";
import {
  getClinicalPatient,
  type ClinicalPatient,
} from "@/lib/clinical-evolution-data";
import { AiWritingTrainingWidget } from "@/components/ai-writing-training/ai-writing-training-widget";
import {
  createEmptyPediAnswers,
  PEDI_AREA_LABELS,
  PEDI_AREAS,
  PEDI_INSTRUMENT,
  type PediArea,
  type PediCapability,
  type PediScoreResult,
} from "@/lib/pedi";
import { cn } from "@/lib/utils";

type PediApplicationPageViewProps = {
  patients: ClinicalPatient[];
};

export function PediApplicationPageView({
  patients,
}: PediApplicationPageViewProps) {
  const { userName, displayRole } = useUserRole();
  const toast = useAppToast();

  const activePatients = patients.filter((patient) => patient.id);
  const patientSelectItems = activePatients.map((patient) => ({
    label: patient.name,
    value: patient.id,
  }));

  const [patientId, setPatientId] = useState(activePatients[0]?.id ?? "");
  const [evaluationDate, setEvaluationDate] = useState(toDateKey(new Date()));
  const [activeArea, setActiveArea] = useState<PediArea>("self_care");
  const [items, setItems] = useState<Record<string, PediCapability>>(
    createEmptyPediAnswers
  );
  const [scores, setScores] = useState<PediScoreResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedPatient = getClinicalPatient(activePatients, patientId);

  const rawTotals = useMemo(() => {
    return PEDI_AREAS.map((area) => {
      const areaItems = Object.entries(items).filter(([id, value]) => {
        if (value !== 1) {
          return false;
        }
        if (area === "self_care") {
          return id.startsWith("AC-");
        }
        if (area === "mobility") {
          return id.startsWith("MB-");
        }
        return id.startsWith("FS-");
      });
      return { area, total: areaItems.length };
    });
  }, [items]);

  function handleItemChange(itemId: string, value: PediCapability) {
    setItems((current) => ({ ...current, [itemId]: value }));
    setScores(null);
  }

  async function handleCalculate() {
    if (!selectedPatient?.birthDate) {
      toast.error({
        title: "Paciente incompleto",
        description: "Selecione um paciente com data de nascimento cadastrada.",
      });
      return;
    }

    setIsCalculating(true);
    try {
      const result = await calculatePediScoreAction({
        birthDate: selectedPatient.birthDate,
        evaluationDate,
        items,
      });

      if (!result.success || !result.data) {
        toast.error({
          title: "Falha no cálculo",
          description: result.error ?? "Não foi possível calcular os escores.",
        });
        return;
      }

      setScores(result.data);
      toast.success({ title: "Escores PEDI calculados." });
    } finally {
      setIsCalculating(false);
    }
  }

  async function handleSave(status: "draft" | "finalized") {
    if (!selectedPatient) {
      toast.error({ title: "Selecione um paciente." });
      return;
    }

    if (!selectedPatient.birthDate) {
      toast.error({ title: "Paciente sem data de nascimento." });
      return;
    }

    if (!scores) {
      toast.error({ title: "Calcule os escores antes de salvar." });
      return;
    }

    setIsSaving(true);
    try {
      const result = await savePediEvaluationAction({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        birthDate: selectedPatient.birthDate,
        evaluationDate,
        items,
        scores,
        professionalName: userName || "Profissional",
        professionalRole: displayRole || "Clínico",
        status,
      });

      if (!result.success) {
        toast.error({
          title: "Falha ao salvar",
          description: result.error ?? "Não foi possível salvar a avaliação.",
        });
        return;
      }

      toast.success({
        title:
          status === "finalized"
            ? "Avaliação PEDI finalizada."
            : "Rascunho PEDI salvo.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageContainer size="wide" className="space-y-6 print:max-w-none">
      <div className="print:hidden">
        <DashboardPageHeader
          title="Aplicar PEDI"
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Evolução" },
            { label: "Avaliações", href: "/dashboard/avaliacoes/aplicar" },
            { label: "PEDI" },
          ]}
          actions={
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/avaliacoes/aplicar" />}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Voltar
            </Button>
          }
        />
      </div>

      <div className="print:hidden space-y-4 rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="pedi-patient">Paciente</Label>
            <Select
              value={patientId}
              items={patientSelectItems}
              onValueChange={(value) => {
                setPatientId((value as string) ?? "");
                setScores(null);
              }}
            >
              <SelectTrigger id="pedi-patient" className="w-full">
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {activePatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {selectedPatient && !selectedPatient.birthDate ? (
              <p className="text-xs text-destructive">
                Paciente sem data de nascimento cadastrada.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pedi-date">Data da avaliação</Label>
            <Input
              id="pedi-date"
              type="date"
              value={evaluationDate}
              onChange={(event) => {
                setEvaluationDate(event.target.value);
                setScores(null);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Resumo bruto</Label>
            <div className="flex h-10 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border/60 bg-muted/20 px-3 text-xs text-muted-foreground">
              {rawTotals.map(({ area, total }) => (
                <span key={area}>
                  {PEDI_AREA_LABELS[area].slice(0, 3)}:{" "}
                  <strong className="text-foreground">{total}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PEDI_AREAS.map((area) => (
            <Button
              key={area}
              type="button"
              size="sm"
              variant={activeArea === area ? "default" : "outline"}
              onClick={() => setActiveArea(area)}
            >
              {PEDI_AREA_LABELS[area]}
            </Button>
          ))}
        </div>
      </div>

      <div className="print:hidden">
        <PediAnswerGrid
          area={activeArea}
          items={items}
          onChange={handleItemChange}
        />
      </div>

      <div className="print:hidden flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleCalculate}
          disabled={isCalculating || !selectedPatient}
        >
          {isCalculating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Calculator className="size-4" aria-hidden />
          )}
          Calcular escores
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSave("draft")}
          disabled={isSaving || !scores}
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          Salvar rascunho
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSave("finalized")}
          disabled={isSaving || !scores}
        >
          Finalizar
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.print()}
          className={cn(!scores && "opacity-60")}
        >
          <Printer className="size-4" aria-hidden />
          Imprimir / PDF
        </Button>
      </div>

      {scores ? <PediScoreResults scores={scores} /> : null}

      <AiWritingTrainingWidget trainingContextKey={PEDI_INSTRUMENT} />

      <PediItemMap items={items} />
    </PageContainer>
  );
}
