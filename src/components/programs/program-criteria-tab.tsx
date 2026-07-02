"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";

import {
  deleteProgramCriterionAction,
  saveProgramCriterionAction,
} from "@/app/actions/program-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  ProgramFormField,
  programInputClassName,
} from "@/components/programs/program-form-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatProgramDateTime,
  programCriterionDegrees,
  type ProgramDetails,
} from "@/lib/program-format";
import type { ProgramCriterionRow } from "@/lib/supabase/database.types";

type ProgramCriteriaTabProps = {
  details: ProgramDetails;
  onSaved: (details: ProgramDetails) => void;
};

const degreeItems = programCriterionDegrees.map((value) => ({
  label: value,
  value,
}));

export function ProgramCriteriaTab({
  details,
  onSaved,
}: ProgramCriteriaTabProps) {
  const toast = useAppToast();
  const [criteria, setCriteria] = useState(details.criteria);
  const [position, setPosition] = useState(String(criteria.length));
  const [acronym, setAcronym] = useState("");
  const [degree, setDegree] = useState<(typeof programCriterionDegrees)[number]>(
    programCriterionDegrees[0]
  );
  const [isPending, startTransition] = useTransition();

  function handleAddCriterion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveProgramCriterionAction({
        programId: details.program.id,
        position: Number.parseInt(position, 10) || 0,
        acronym,
        degree,
      });

      if (!result.success) {
        toast.error({
          title: "Falha ao adicionar",
          description: result.error ?? "Não foi possível adicionar o critério.",
        });
        return;
      }

      if (!result.data?.criterion) {
        toast.error({
          title: "Falha ao adicionar",
          description: "Não foi possível adicionar o critério.",
        });
        return;
      }

      const nextCriteria = [...criteria, result.data.criterion].sort(
        (left, right) => left.position - right.position
      );
      setCriteria(nextCriteria);
      onSaved({ ...details, criteria: nextCriteria });
      setPosition(String(nextCriteria.length));
      setAcronym("");
      toast.success({ title: "Critério adicionado" });
    });
  }

  function handleDeleteCriterion(criterion: ProgramCriterionRow) {
    startTransition(async () => {
      const result = await deleteProgramCriterionAction(criterion.id);

      if (!result.success) {
        toast.error({
          title: "Falha ao remover",
          description: result.error ?? "Não foi possível remover o critério.",
        });
        return;
      }

      const nextCriteria = criteria.filter((item) => item.id !== criterion.id);
      setCriteria(nextCriteria);
      onSaved({ ...details, criteria: nextCriteria });
      toast.success({ title: "Critério removido" });
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAddCriterion}
        className="grid gap-4 rounded-xl border border-border/70 bg-muted/15 p-4 md:grid-cols-4"
      >
        <ProgramFormField id="criterion-position" label="Posição">
          <Input
            id="criterion-position"
            type="number"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            className={programInputClassName}
          />
        </ProgramFormField>
        <ProgramFormField id="criterion-acronym" label="Sigla">
          <Input
            id="criterion-acronym"
            value={acronym}
            onChange={(event) => setAcronym(event.target.value)}
            className={programInputClassName}
          />
        </ProgramFormField>
        <ProgramFormField id="criterion-degree" label="Grau" required>
          <Select
            value={degree}
            items={degreeItems}
            onValueChange={(value) =>
              setDegree(
                (value ?? programCriterionDegrees[0]) as (typeof programCriterionDegrees)[number]
              )
            }
          >
            <SelectTrigger id="criterion-degree" className={programInputClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {degreeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </ProgramFormField>
        <div className="flex items-end">
          <Button type="submit" disabled={isPending}>
            <Plus className="size-4" />
            Novo Critério
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Pos</TableHead>
              <TableHead>Data Registro</TableHead>
              <TableHead>Sigla</TableHead>
              <TableHead>Grau</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {criteria.map((criterion) => (
              <TableRow key={criterion.id}>
                <TableCell>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                    #{criterion.id.replace(/\D/g, "").slice(0, 7) || criterion.id.slice(0, 7)}
                  </span>
                </TableCell>
                <TableCell>{criterion.position}</TableCell>
                <TableCell>{formatProgramDateTime(criterion.created_at)}</TableCell>
                <TableCell>{criterion.acronym ?? "—"}</TableCell>
                <TableCell>{criterion.degree}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCriterion(criterion)}
                    aria-label="Remover critério"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
