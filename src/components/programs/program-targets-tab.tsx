"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Download, Loader2, Plus, Trash2 } from "lucide-react";

import {
  deleteProgramTargetAction,
  saveProgramTargetAction,
} from "@/app/actions/program-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  ProgramFormField,
  programInputClassName,
} from "@/components/programs/program-form-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatProgramDate,
  formatProgramDisplayValue,
  programTargetSituationLabels,
  type ProgramDetails,
} from "@/lib/program-format";
import type { ProgramTargetRow } from "@/lib/supabase/database.types";

type ProgramTargetsTabProps = {
  details: ProgramDetails;
  onSaved: (details: ProgramDetails) => void;
};

export function ProgramTargetsTab({ details, onSaved }: ProgramTargetsTabProps) {
  const toast = useAppToast();
  const [targets, setTargets] = useState(details.targets);
  const [targetGroup, setTargetGroup] = useState("");
  const [targetName, setTargetName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPending, startTransition] = useTransition();

  function handleAddTarget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveProgramTargetAction({
        programId: details.program.id,
        targetGroup,
        targetName,
        sortOrder: Number.parseInt(sortOrder, 10) || 0,
      });

      if (!result.success) {
        toast.error({
          title: "Falha ao adicionar",
          description: result.error ?? "Não foi possível adicionar o alvo.",
        });
        return;
      }

      if (!result.data?.target) {
        toast.error({
          title: "Falha ao adicionar",
          description: "Não foi possível adicionar o alvo.",
        });
        return;
      }

      const nextTargets = [...targets, result.data.target].sort(
        (left, right) => left.sort_order - right.sort_order
      );
      setTargets(nextTargets);
      onSaved({ ...details, targets: nextTargets });
      setTargetGroup("");
      setTargetName("");
      setSortOrder(String(nextTargets.length));
      toast.success({ title: "Alvo adicionado" });
    });
  }

  function handleDeleteTarget(target: ProgramTargetRow) {
    startTransition(async () => {
      const result = await deleteProgramTargetAction(target.id);

      if (!result.success) {
        toast.error({
          title: "Falha ao remover",
          description: result.error ?? "Não foi possível remover o alvo.",
        });
        return;
      }

      const nextTargets = targets.filter((item) => item.id !== target.id);
      setTargets(nextTargets);
      onSaved({ ...details, targets: nextTargets });
      toast.success({ title: "Alvo removido" });
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => toast.info({ title: "Em desenvolvimento", description: "Importação de alvos estará disponível em breve." })}>
          <Download className="size-4" />
          Importação
        </Button>
      </div>

      <form
        onSubmit={handleAddTarget}
        className="grid gap-4 rounded-xl border border-border/70 bg-muted/15 p-4 md:grid-cols-4"
      >
        <ProgramFormField id="target-group" label="Grupo">
          <Input
            id="target-group"
            value={targetGroup}
            onChange={(event) => setTargetGroup(event.target.value)}
            className={programInputClassName}
          />
        </ProgramFormField>
        <ProgramFormField id="target-order" label="Ordem">
          <Input
            id="target-order"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className={programInputClassName}
          />
        </ProgramFormField>
        <ProgramFormField id="target-name" label="Alvo" required className="md:col-span-2">
          <Input
            id="target-name"
            value={targetName}
            onChange={(event) => setTargetName(event.target.value)}
            className={programInputClassName}
            required
          />
        </ProgramFormField>
        <div className="flex items-end md:col-span-4">
          <Button type="submit" disabled={isPending}>
            <Plus className="size-4" />
            Novo Alvo
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Alvo</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Data Início</TableHead>
              <TableHead>Manutenções</TableHead>
              <TableHead>Dt. Adquirido</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {targets.length > 0 ? (
              targets.map((target) => (
                <TableRow key={target.id}>
                  <TableCell>{formatProgramDisplayValue(target.target_group)}</TableCell>
                  <TableCell>{target.sort_order}</TableCell>
                  <TableCell className="font-medium">{target.target_name}</TableCell>
                  <TableCell>
                    {programTargetSituationLabels[target.situation]}
                  </TableCell>
                  <TableCell>{formatProgramDate(target.start_date)}</TableCell>
                  <TableCell>
                    {formatProgramDisplayValue(target.maintenances)}
                  </TableCell>
                  <TableCell>{formatProgramDate(target.acquired_date)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTarget(target)}
                      aria-label="Remover alvo"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  Não há itens a serem exibidos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
