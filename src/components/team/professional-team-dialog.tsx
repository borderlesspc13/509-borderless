"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Users } from "lucide-react";

import {
  getProfessionalTeamAction,
  saveProfessionalTeamAction,
  type ProfessionalTeamPatient,
} from "@/app/actions/professional-team-actions";
import type { TeamMember } from "@/app/actions/team-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfessionalDisplaySubtitle } from "@/lib/professional-format";

type ProfessionalTeamDialogProps = {
  professional: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProfessionalTeamDialog({
  professional,
  open,
  onOpenChange,
}: ProfessionalTeamDialogProps) {
  const toast = useAppToast();
  const [patients, setPatients] = useState<ProfessionalTeamPatient[]>([]);
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();

  const loadTeam = useCallback(async () => {
    if (!professional) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await getProfessionalTeamAction(professional.id);

    if (!result.success) {
      setError(result.error ?? "Não foi possível carregar a equipe.");
      setPatients([]);
      setSelectedPatientIds(new Set());
    } else {
      const loadedPatients = result.data?.patients ?? [];
      setPatients(loadedPatients);
      setSelectedPatientIds(
        new Set(
          loadedPatients
            .filter((patient) => patient.isAssigned)
            .map((patient) => patient.id)
        )
      );
    }

    setIsLoading(false);
  }, [professional]);

  useEffect(() => {
    if (open && professional) {
      void loadTeam();
      setSearchQuery("");
    }
  }, [open, professional, loadTeam]);

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) =>
      patient.fullName.toLowerCase().includes(query)
    );
  }, [patients, searchQuery]);

  const allFilteredSelected =
    filteredPatients.length > 0 &&
    filteredPatients.every((patient) => selectedPatientIds.has(patient.id));

  const someFilteredSelected =
    filteredPatients.some((patient) => selectedPatientIds.has(patient.id)) &&
    !allFilteredSelected;

  function togglePatient(patientId: string) {
    setSelectedPatientIds((current) => {
      const next = new Set(current);

      if (next.has(patientId)) {
        next.delete(patientId);
      } else {
        next.add(patientId);
      }

      return next;
    });
  }

  function handleToggleAllFiltered() {
    setSelectedPatientIds((current) => {
      const next = new Set(current);

      if (allFilteredSelected) {
        filteredPatients.forEach((patient) => next.delete(patient.id));
      } else {
        filteredPatients.forEach((patient) => next.add(patient.id));
      }

      return next;
    });
  }

  function handleSave() {
    if (!professional) {
      return;
    }

    setError(null);

    startSaveTransition(async () => {
      const result = await saveProfessionalTeamAction({
        professionalId: professional.id,
        patientIds: Array.from(selectedPatientIds),
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar a equipe.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }

      toast.success({
        title: "Equipe atualizada",
        description: `${result.data?.assignedCount ?? 0} aprendiz(es) vinculado(s) a ${professional.fullName}.`,
      });
      onOpenChange(false);
    });
  }

  const subtitle = professional
    ? getProfessionalDisplaySubtitle(
        professional.cpf,
        professional.professionalCouncil
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,44rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" aria-hidden />
            Equipe terapêutica
          </DialogTitle>
          <DialogDescription>
            {professional ? (
              <>
                Vincule aprendizes a{" "}
                <span className="font-medium text-foreground">
                  {professional.fullName}
                </span>
                {subtitle ? ` (${subtitle})` : ""}.
              </>
            ) : (
              "Selecione os aprendizes deste profissional."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="team-patient-search">Buscar aprendiz</Label>
            <Input
              id="team-patient-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Digite o nome do aprendiz..."
              className="h-10"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
            <input
              type="checkbox"
              className="size-4 rounded border-border accent-primary"
              checked={allFilteredSelected}
              ref={(element) => {
                if (element) {
                  element.indeterminate = someFilteredSelected;
                }
              }}
              onChange={handleToggleAllFiltered}
              disabled={isLoading || filteredPatients.length === 0}
            />
            <span className="text-sm font-medium">Marcar Todos</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {selectedPatientIds.size} selecionado(s)
            </span>
          </label>

          {isLoading ? (
            <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Carregando aprendizes...
            </p>
          ) : error ? (
            <p className="py-4 text-sm text-destructive">{error}</p>
          ) : filteredPatients.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              {patients.length === 0
                ? "Nenhum aprendiz ativo disponível."
                : "Nenhum aprendiz encontrado para esta busca."}
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredPatients.map((patient) => {
                const isChecked = selectedPatientIds.has(patient.id);

                return (
                  <li key={patient.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:bg-muted/30">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border accent-primary"
                        checked={isChecked}
                        onChange={() => togglePatient(patient.id)}
                      />
                      <span className="text-sm font-medium">
                        {patient.fullName}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading || !professional}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Salvando...
              </>
            ) : (
              "Salvar equipe"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
