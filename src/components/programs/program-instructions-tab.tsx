"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { saveProgramInstructionsAction } from "@/app/actions/program-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  ProgramCharacterTextarea,
  ProgramFormField,
} from "@/components/programs/program-form-shared";
import { Button } from "@/components/ui/button";
import type { ProgramDetails } from "@/lib/program-format";

type ProgramInstructionsTabProps = {
  details: ProgramDetails;
  onSaved: (details: ProgramDetails) => void;
};

export function ProgramInstructionsTab({
  details,
  onSaved,
}: ProgramInstructionsTabProps) {
  const toast = useAppToast();
  const program = details.program;
  const [teachingProcedure, setTeachingProcedure] = useState(
    program.teaching_procedure ?? ""
  );
  const [instructionSd, setInstructionSd] = useState(program.instruction_sd ?? "");
  const [objective, setObjective] = useState(program.objective ?? "");
  const [hintStep, setHintStep] = useState(program.hint_step ?? "");
  const [correctionProcedure, setCorrectionProcedure] = useState(
    program.correction_procedure ?? ""
  );
  const [learningCriterion, setLearningCriterion] = useState(
    program.learning_criterion ?? ""
  );
  const [materialsUsed, setMaterialsUsed] = useState(program.materials_used ?? "");
  const [observations, setObservations] = useState(program.observations ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveProgramInstructionsAction({
        programId: program.id,
        teachingProcedure,
        instructionSd,
        objective,
        hintStep,
        correctionProcedure,
        learningCriterion,
        materialsUsed,
        observations,
      });

      if (!result.success) {
        toast.error({
          title: "Falha ao salvar",
          description: result.error ?? "Não foi possível salvar as instruções.",
        });
        return;
      }

      if (result.data?.program) {
        onSaved({ ...details, program: result.data.program });
      }

      toast.success({
        title: "Instruções salvas",
        description: result.message,
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <ProgramFormField id="teaching-procedure" label="Procedimento de Ensino">
          <ProgramCharacterTextarea
            id="teaching-procedure"
            value={teachingProcedure}
            onChange={setTeachingProcedure}
          />
        </ProgramFormField>
        <ProgramFormField
          id="instruction-sd"
          label="Instrução (Sd)"
          hint="Estímulo discriminativo do programa."
        >
          <ProgramCharacterTextarea
            id="instruction-sd"
            value={instructionSd}
            onChange={setInstructionSd}
            placeholder="Digite o nome da instrução (Sd) para o programa a ser utilizado"
          />
        </ProgramFormField>
        <ProgramFormField id="objective" label="Objetivo">
          <ProgramCharacterTextarea
            id="objective"
            value={objective}
            onChange={setObjective}
            placeholder="Digite a descrição do objetivo a ser alcançado"
          />
        </ProgramFormField>
        <ProgramFormField
          id="hint-step"
          label="Passo da dica"
          hint="Sequência de dicas aplicadas no ensino."
        >
          <ProgramCharacterTextarea
            id="hint-step"
            value={hintStep}
            onChange={setHintStep}
            placeholder="Digite o passo da dica para este programa"
          />
        </ProgramFormField>
        <ProgramFormField id="correction-procedure" label="Procedimento de correção">
          <ProgramCharacterTextarea
            id="correction-procedure"
            value={correctionProcedure}
            onChange={setCorrectionProcedure}
            placeholder="Digite o procedimento de correção utilizado neste programa"
          />
        </ProgramFormField>
        <ProgramFormField id="learning-criterion" label="Critério de aprendizado">
          <ProgramCharacterTextarea
            id="learning-criterion"
            value={learningCriterion}
            onChange={setLearningCriterion}
            placeholder="Digite o critério de aprendizado para este programa"
          />
        </ProgramFormField>
        <ProgramFormField id="materials-used" label="Materiais utilizados">
          <ProgramCharacterTextarea
            id="materials-used"
            value={materialsUsed}
            onChange={setMaterialsUsed}
            placeholder="Digite a descrição dos materiais a serem utilizados neste programa"
          />
        </ProgramFormField>
        <ProgramFormField id="observations" label="Observações" className="lg:col-span-2">
          <ProgramCharacterTextarea
            id="observations"
            value={observations}
            onChange={setObservations}
          />
        </ProgramFormField>
      </div>

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
