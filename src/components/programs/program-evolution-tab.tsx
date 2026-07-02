"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { saveProgramEvolutionAction } from "@/app/actions/program-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { programInputClassName } from "@/components/programs/program-form-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProgramDetails } from "@/lib/program-format";

type ProgramEvolutionTabProps = {
  details: ProgramDetails;
  onSaved: (details: ProgramDetails) => void;
};

function ParameterRow({
  label,
  pctValue,
  sessionsValue,
  onPctChange,
  onSessionsChange,
  incorrect,
}: {
  label: string;
  pctValue: string;
  sessionsValue: string;
  onPctChange: (value: string) => void;
  onSessionsChange: (value: string) => void;
  incorrect?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Input
          value={pctValue}
          onChange={(event) => onPctChange(event.target.value)}
          placeholder="Digite a porcentagem"
          className={`${programInputClassName} max-w-[10rem]`}
          inputMode="decimal"
        />
        <span>
          % de tentativas {incorrect ? "incorretas" : "corretas"} por
        </span>
        <Input
          value={sessionsValue}
          onChange={(event) => onSessionsChange(event.target.value)}
          placeholder="Digite a quantidade"
          className={`${programInputClassName} max-w-[10rem]`}
          inputMode="numeric"
        />
        <span>sessões consecutivas.</span>
      </div>
    </div>
  );
}

export function ProgramEvolutionTab({
  details,
  onSaved,
}: ProgramEvolutionTabProps) {
  const toast = useAppToast();
  const program = details.program;
  const [evolutionPrimaryPct, setEvolutionPrimaryPct] = useState(
    program.evolution_primary_correct_pct?.toString() ?? ""
  );
  const [evolutionPrimarySessions, setEvolutionPrimarySessions] = useState(
    program.evolution_primary_sessions?.toString() ?? ""
  );
  const [evolutionSecondaryPct, setEvolutionSecondaryPct] = useState(
    program.evolution_secondary_correct_pct?.toString() ?? ""
  );
  const [evolutionSecondarySessions, setEvolutionSecondarySessions] = useState(
    program.evolution_secondary_sessions?.toString() ?? ""
  );
  const [correctionPrimaryPct, setCorrectionPrimaryPct] = useState(
    program.correction_primary_incorrect_pct?.toString() ?? ""
  );
  const [correctionPrimarySessions, setCorrectionPrimarySessions] = useState(
    program.correction_primary_sessions?.toString() ?? ""
  );
  const [correctionSecondaryPct, setCorrectionSecondaryPct] = useState(
    program.correction_secondary_incorrect_pct?.toString() ?? ""
  );
  const [correctionSecondarySessions, setCorrectionSecondarySessions] = useState(
    program.correction_secondary_sessions?.toString() ?? ""
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveProgramEvolutionAction({
        programId: program.id,
        evolutionPrimaryCorrectPct: evolutionPrimaryPct,
        evolutionPrimarySessions: evolutionPrimarySessions,
        evolutionSecondaryCorrectPct: evolutionSecondaryPct,
        evolutionSecondarySessions: evolutionSecondarySessions,
        correctionPrimaryIncorrectPct: correctionPrimaryPct,
        correctionPrimarySessions: correctionPrimarySessions,
        correctionSecondaryIncorrectPct: correctionSecondaryPct,
        correctionSecondarySessions: correctionSecondarySessions,
      });

      if (!result.success) {
        toast.error({
          title: "Falha ao salvar",
          description: result.error ?? "Não foi possível salvar os parâmetros.",
        });
        return;
      }

      if (result.data?.program) {
        onSaved({ ...details, program: result.data.program });
      }

      toast.success({
        title: "Parâmetros salvos",
        description: result.message,
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-5">
        <h3 className="text-base font-semibold text-foreground">Evolução</h3>
        <ParameterRow
          label="Parâmetro primário"
          pctValue={evolutionPrimaryPct}
          sessionsValue={evolutionPrimarySessions}
          onPctChange={setEvolutionPrimaryPct}
          onSessionsChange={setEvolutionPrimarySessions}
        />
        <ParameterRow
          label="Parâmetro secundário (opcional)"
          pctValue={evolutionSecondaryPct}
          sessionsValue={evolutionSecondarySessions}
          onPctChange={setEvolutionSecondaryPct}
          onSessionsChange={setEvolutionSecondarySessions}
        />
      </section>

      <section className="space-y-5 border-t border-border/60 pt-8">
        <h3 className="text-base font-semibold text-foreground">Correção</h3>
        <ParameterRow
          label="Parâmetro primário"
          pctValue={correctionPrimaryPct}
          sessionsValue={correctionPrimarySessions}
          onPctChange={setCorrectionPrimaryPct}
          onSessionsChange={setCorrectionPrimarySessions}
          incorrect
        />
        <ParameterRow
          label="Parâmetro secundário (opcional)"
          pctValue={correctionSecondaryPct}
          sessionsValue={correctionSecondarySessions}
          onPctChange={setCorrectionSecondaryPct}
          onSessionsChange={setCorrectionSecondarySessions}
          incorrect
        />
      </section>

      <div className="flex gap-3 border-t border-border/60 pt-5">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
