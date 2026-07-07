"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { BookOpen, Loader2, Plus, Trash2 } from "lucide-react";

import {
  deleteHomeActivityAction,
  listHomeActivitiesAction,
  saveHomeActivityAction,
  type HomeActivity,
} from "@/app/actions/home-activity-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { ProtectedComponent } from "@/components/auth/protected-component";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { PERMISSIONS } from "@/lib/rbac";

type HomeActivitiesPanelProps = {
  patientId: string;
  patientName: string;
};

const emptyForm = {
  title: "",
  description: "",
  instructions: "",
  dueDate: "",
  isPublished: true,
};

export function HomeActivitiesPanel({
  patientId,
  patientName,
}: HomeActivitiesPanelProps) {
  const toast = useAppToast();
  const [activities, setActivities] = useState<HomeActivity[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startSaveTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await listHomeActivitiesAction(patientId);

    if (!result.success) {
      setError(result.error ?? "Não foi possível carregar as atividades.");
      setActivities([]);
    } else {
      setActivities(result.data?.activities ?? []);
    }

    setIsLoading(false);
  }, [patientId]);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleEdit(activity: HomeActivity) {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      description: activity.description,
      instructions: activity.instructions ?? "",
      dueDate: activity.dueDate ?? "",
      isPublished: activity.isPublished,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startSaveTransition(async () => {
      const result = await saveHomeActivityAction({
        id: editingId ?? undefined,
        patientId,
        title: form.title,
        description: form.description,
        instructions: form.instructions,
        dueDate: form.dueDate,
        isPublished: form.isPublished,
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar a atividade.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }

      if (result.data?.activity) {
        setActivities((current) => {
          const nextActivity = result.data!.activity;
          const exists = current.some(
            (activity) => activity.id === nextActivity.id
          );

          if (exists) {
            return current.map((activity) =>
              activity.id === nextActivity.id ? nextActivity : activity
            );
          }

          return [nextActivity, ...current];
        });
      }

      toast.success({
        title: editingId ? "Atividade atualizada" : "Atividade publicada",
        description: editingId
          ? "As alterações foram salvas."
          : "A atividade está disponível no portal da família.",
      });
      resetForm();
    });
  }

  function handleDelete(activityId: string) {
    setDeletingId(activityId);

    startSaveTransition(async () => {
      const result = await deleteHomeActivityAction(activityId);

      if (!result.success) {
        const message = result.error ?? "Não foi possível remover a atividade.";
        toast.error({ title: "Falha ao remover", description: message });
        setDeletingId(null);
        return;
      }

      setActivities((current) =>
        current.filter((activity) => activity.id !== activityId)
      );

      if (editingId === activityId) {
        resetForm();
      }

      toast.success({
        title: "Atividade removida",
        description: "A atividade foi excluída do prontuário.",
      });
      setDeletingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <ProtectedComponent permission={PERMISSIONS.CLINICAL_EVOLUTION_MANAGE}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-5 text-primary" aria-hidden />
              {editingId ? "Editar atividade" : "Nova atividade para casa"}
            </CardTitle>
            <CardDescription>
              Publique orientações e exercícios para os responsáveis de{" "}
              {patientName} acessarem no portal da família.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="activity-title">Título</Label>
                  <Input
                    id="activity-title"
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Ex.: Exercícios de coordenação motora"
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="activity-description">Descrição</Label>
                  <Textarea
                    id="activity-description"
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Descreva o objetivo da atividade..."
                    className="min-h-24"
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="activity-instructions">
                    Instruções para os pais
                  </Label>
                  <Textarea
                    id="activity-instructions"
                    value={form.instructions}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        instructions: event.target.value,
                      }))
                    }
                    placeholder="Passo a passo, materiais necessários, tempo estimado..."
                    className="min-h-28"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-due-date">Prazo (opcional)</Label>
                  <Input
                    id="activity-due-date"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    className="h-10"
                  />
                </div>

                <label className="flex items-center gap-3 self-end rounded-lg border border-border/70 px-3 py-2.5">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border accent-primary"
                    checked={form.isPublished}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isPublished: event.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm">Publicar no portal da família</span>
                </label>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : null}
                  {editingId ? "Salvar alterações" : "Publicar atividade"}
                </Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSaving}
                  >
                    Cancelar edição
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </ProtectedComponent>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" aria-hidden />
            Atividades publicadas
          </CardTitle>
          <CardDescription>
            Lista de atividades para casa vinculadas a este aprendiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Carregando atividades...
            </p>
          ) : activities.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhuma atividade cadastrada ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          {activity.title}
                        </h3>
                        <Badge
                          variant={activity.isPublished ? "default" : "secondary"}
                        >
                          {activity.isPublished ? "Publicada" : "Rascunho"}
                        </Badge>
                        {activity.dueDateLabel ? (
                          <Badge variant="outline">
                            Prazo: {activity.dueDateLabel}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {activity.description}
                      </p>
                      {activity.instructions ? (
                        <p className="rounded-lg bg-muted/25 px-3 py-2 text-sm leading-relaxed">
                          {activity.instructions}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        Por {activity.createdByName} · {activity.createdAtLabel}
                      </p>
                    </div>

                    <ProtectedComponent
                      permission={PERMISSIONS.CLINICAL_EVOLUTION_MANAGE}
                    >
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(activity)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleDelete(activity.id)}
                          disabled={deletingId === activity.id}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </ProtectedComponent>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
