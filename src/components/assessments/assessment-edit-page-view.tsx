"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Info, Plus, Trash2 } from "lucide-react";

import {
  createAssessmentScoreGroupAction,
  deleteAssessmentLevelAction,
  deleteAssessmentScoreAction,
  deleteAssessmentScoreGroupAction,
  deleteAssessmentSkillAction,
  getAssessmentTemplateAction,
  saveAssessmentLevelAction,
  saveAssessmentScoreAction,
  saveAssessmentSkillAction,
  saveAssessmentTemplateAction,
} from "@/app/actions/assessment-template-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  assessmentTypeOptions,
  type AssessmentEvaluationType,
  type AssessmentTemplateDetails,
} from "@/lib/assessment-format";
import type {
  AssessmentLevelRow,
  AssessmentScoreRow,
  AssessmentSkillRow,
} from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type AssessmentEditPageViewProps = {
  initialDetails: AssessmentTemplateDetails;
};

const inputClassName = "h-11 w-full";
const textareaClassName =
  "min-h-32 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function EmptyTableMessage() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
      <Info className="size-4 shrink-0" aria-hidden />
      Não há itens a serem exibidos.
    </div>
  );
}

export function AssessmentEditPageView({
  initialDetails,
}: AssessmentEditPageViewProps) {
  const [details, setDetails] = useState(initialDetails);
  const [evaluationType, setEvaluationType] = useState(
    initialDetails.template.evaluation_type
  );
  const [name, setName] = useState(initialDetails.template.name);
  const [description, setDescription] = useState(
    initialDetails.template.description ?? ""
  );
  const toast = useAppToast();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<AssessmentLevelRow | null>(
    null
  );
  const [levelOrder, setLevelOrder] = useState("");
  const [levelDescription, setLevelDescription] = useState("");
  const [levelAgeRange, setLevelAgeRange] = useState("");

  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<AssessmentSkillRow | null>(
    null
  );
  const [skillOrder, setSkillOrder] = useState("");
  const [skillDescription, setSkillDescription] = useState("");

  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [scoreGroupId, setScoreGroupId] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState<AssessmentScoreRow | null>(
    null
  );
  const [scoreOrder, setScoreOrder] = useState("");
  const [scoreType, setScoreType] = useState("");
  const [scoreDescription, setScoreDescription] = useState("");
  const [scoreValue, setScoreValue] = useState("");

  const scoresByGroup = useMemo(() => {
    const map = new Map<string, AssessmentScoreRow[]>();

    details.scoreGroups.forEach((group) => {
      map.set(
        group.id,
        details.scores
          .filter((score) => score.group_id === group.id)
          .sort((a, b) => a.sort_order - b.sort_order)
      );
    });

    return map;
  }, [details.scoreGroups, details.scores]);

  async function reloadDetails() {
    const result = await getAssessmentTemplateAction(details.template.id);

    if (result.success && result.data) {
      setDetails(result.data);
    }
  }

  function handleSaveGeneral(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await saveAssessmentTemplateAction({
        templateId: details.template.id,
        name,
        description,
        evaluationType,
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }

      if (result.data?.template) {
        setDetails((current) => ({
          ...current,
          template: result.data!.template,
        }));
      }

      setSuccessMessage("Dados gerais salvos com sucesso.");
      toast.success({
        title: "Dados gerais salvos",
        description: "As informações da avaliação foram atualizadas.",
      });
    });
  }

  function openLevelDialog(level?: AssessmentLevelRow) {
    setEditingLevel(level ?? null);
    setLevelOrder(level ? String(level.sort_order) : "");
    setLevelDescription(level?.description ?? "");
    setLevelAgeRange(level?.age_range ?? "");
    setLevelDialogOpen(true);
  }

  function openSkillDialog(skill?: AssessmentSkillRow) {
    setEditingSkill(skill ?? null);
    setSkillOrder(skill ? String(skill.sort_order) : "");
    setSkillDescription(skill?.description ?? "");
    setSkillDialogOpen(true);
  }

  function openScoreDialog(groupId: string, score?: AssessmentScoreRow) {
    setScoreGroupId(groupId);
    setEditingScore(score ?? null);
    setScoreOrder(score ? String(score.sort_order) : "");
    setScoreType(score?.score_type ?? "");
    setScoreDescription(score?.description ?? "");
    setScoreValue(score?.value != null ? String(score.value) : "");
    setScoreDialogOpen(true);
  }

  function handleSaveLevel() {
    startTransition(async () => {
      const result = await saveAssessmentLevelAction({
        templateId: details.template.id,
        levelId: editingLevel?.id,
        sortOrder: Number(levelOrder),
        description: levelDescription,
        ageRange: levelAgeRange,
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar o nível.";
        setError(message);
        toast.error({ title: "Falha ao salvar nível", description: message });
        return;
      }

      setLevelDialogOpen(false);
      toast.success({
        title: editingLevel ? "Nível atualizado" : "Nível criado",
        description: "O nível foi salvo com sucesso.",
      });
      await reloadDetails();
    });
  }

  function handleSaveSkill() {
    startTransition(async () => {
      const result = await saveAssessmentSkillAction({
        templateId: details.template.id,
        skillId: editingSkill?.id,
        sortOrder: Number(skillOrder),
        description: skillDescription,
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar a habilidade.";
        setError(message);
        toast.error({ title: "Falha ao salvar habilidade", description: message });
        return;
      }

      setSkillDialogOpen(false);
      toast.success({
        title: editingSkill ? "Habilidade atualizada" : "Habilidade criada",
        description: "A habilidade foi salva com sucesso.",
      });
      await reloadDetails();
    });
  }

  function handleSaveScore() {
    if (!scoreGroupId) {
      return;
    }

    startTransition(async () => {
      const result = await saveAssessmentScoreAction({
        templateId: details.template.id,
        groupId: scoreGroupId,
        scoreId: editingScore?.id,
        sortOrder: Number(scoreOrder),
        scoreType,
        description: scoreDescription,
        value: scoreValue ? Number(scoreValue) : null,
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar a pontuação.";
        setError(message);
        toast.error({ title: "Falha ao salvar pontuação", description: message });
        return;
      }

      setScoreDialogOpen(false);
      toast.success({
        title: editingScore ? "Pontuação atualizada" : "Pontuação criada",
        description: "A pontuação foi salva com sucesso.",
      });
      await reloadDetails();
    });
  }

  function handleCreateScoreGroup() {
    startTransition(async () => {
      const result = await createAssessmentScoreGroupAction(details.template.id);

      if (!result.success) {
        const message = result.error ?? "Não foi possível criar o grupo.";
        setError(message);
        toast.error({ title: "Falha ao criar grupo", description: message });
        return;
      }

      toast.success({
        title: "Grupo criado",
        description: "Novo grupo de pontuação adicionado.",
      });
      await reloadDetails();
    });
  }

  return (
    <PageContainer size="wide" className="space-y-8">
      <DashboardPageHeader
        title="Editar Avaliação"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Avaliações", href: "/dashboard/avaliacoes" },
          { label: "Editar" },
        ]}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/avaliacoes" />}
          >
            Voltar
          </Button>
        }
      />

      <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <Tabs defaultValue="geral" className="gap-0">
          <div className="border-b border-border/60 bg-muted/25 px-6 py-4 sm:px-8">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:grid-cols-5">
              {[
                { value: "geral", label: "Geral" },
                { value: "niveis", label: "Níveis" },
                { value: "habilidades", label: "Habilidades" },
                { value: "pontuacao", label: "Pontuação" },
                { value: "tarefas", label: "Tarefas/Testes" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg border border-transparent px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-active:border-transparent data-active:bg-foreground data-active:text-background sm:text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="geral" className="mt-0 px-6 py-8 sm:px-8">
            <form className="mx-auto max-w-3xl space-y-6" onSubmit={handleSaveGeneral}>
              <div className="space-y-3">
                <Label>Tipo de Avaliação *</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {assessmentTypeOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm",
                        evaluationType === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border/70"
                      )}
                    >
                      <input
                        type="radio"
                        checked={evaluationType === option.value}
                        onChange={() => setEvaluationType(option.value)}
                        className="size-4 accent-primary"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="edit-assessment-name">Nome *</Label>
                <Input
                  id="edit-assessment-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClassName}
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="edit-assessment-description">Descrição</Label>
                <textarea
                  id="edit-assessment-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={textareaClassName}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  className="bg-clinical-success text-white hover:bg-clinical-success/90"
                  disabled={isPending}
                >
                  <CheckCircle2 className="size-4" aria-hidden />
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href="/dashboard/avaliacoes" />}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="niveis" className="mt-0 px-6 py-8 sm:px-8">
            <div className="space-y-4">
              <Button type="button" onClick={() => openLevelDialog()}>
                <Plus className="size-4" aria-hidden />
                Novo Nível
              </Button>

              {details.levels.length === 0 ? (
                <EmptyTableMessage />
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/70">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Ordem</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead>Faixa Etária</TableHead>
                        <TableHead className="w-24" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.levels.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell>{level.code}</TableCell>
                          <TableCell>{level.sort_order}</TableCell>
                          <TableCell>{level.description}</TableCell>
                          <TableCell>{level.age_range ?? "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => openLevelDialog(level)}
                              >
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() =>
                                  startTransition(async () => {
                                    const result =
                                      await deleteAssessmentLevelAction(level.id);
                                    if (!result.success) {
                                      toast.error({
                                        title: "Falha ao excluir",
                                        description:
                                          result.error ??
                                          "Não foi possível excluir o nível.",
                                      });
                                      return;
                                    }
                                    toast.success({
                                      title: "Nível removido",
                                      description: "O nível foi excluído com sucesso.",
                                    });
                                    await reloadDetails();
                                  })
                                }
                              >
                                <Trash2 className="size-4" aria-hidden />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="habilidades" className="mt-0 px-6 py-8 sm:px-8">
            <div className="space-y-4">
              <Button type="button" onClick={() => openSkillDialog()}>
                <Plus className="size-4" aria-hidden />
                Nova Habilidade
              </Button>

              {details.skills.length === 0 ? (
                <EmptyTableMessage />
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/70">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Ordem</TableHead>
                        <TableHead>Habilidade</TableHead>
                        <TableHead className="w-24" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.skills.map((skill) => (
                        <TableRow key={skill.id}>
                          <TableCell>{skill.code}</TableCell>
                          <TableCell>{skill.sort_order}</TableCell>
                          <TableCell>{skill.description}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => openSkillDialog(skill)}
                              >
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() =>
                                  startTransition(async () => {
                                    const result =
                                      await deleteAssessmentSkillAction(skill.id);
                                    if (!result.success) {
                                      toast.error({
                                        title: "Falha ao excluir",
                                        description:
                                          result.error ??
                                          "Não foi possível excluir a habilidade.",
                                      });
                                      return;
                                    }
                                    toast.success({
                                      title: "Habilidade removida",
                                      description:
                                        "A habilidade foi excluída com sucesso.",
                                    });
                                    await reloadDetails();
                                  })
                                }
                              >
                                <Trash2 className="size-4" aria-hidden />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pontuacao" className="mt-0 px-6 py-8 sm:px-8">
            <div className="space-y-4">
              {details.scoreGroups.length === 0 ? (
                <>
                  <EmptyTableMessage />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-primary/30 text-primary hover:bg-primary/5"
                    onClick={handleCreateScoreGroup}
                  >
                    <Plus className="size-4" aria-hidden />
                    Novo grupo
                  </Button>
                </>
              ) : (
                <>
                  {details.scoreGroups.map((group) => (
                    <div
                      key={group.id}
                      className="overflow-hidden rounded-xl border border-border/70"
                    >
                      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => openScoreDialog(group.id)}
                        >
                          <Plus className="size-4" aria-hidden />
                          Nova Pontuação
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            startTransition(async () => {
                              const result =
                                await deleteAssessmentScoreGroupAction(group.id);
                              if (!result.success) {
                                toast.error({
                                  title: "Falha ao excluir",
                                  description:
                                    result.error ??
                                    "Não foi possível excluir o grupo.",
                                });
                                return;
                              }
                              toast.success({
                                title: "Grupo removido",
                                description: "O grupo foi excluído com sucesso.",
                              });
                              await reloadDetails();
                            })
                          }
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>

                      {(scoresByGroup.get(group.id)?.length ?? 0) === 0 ? (
                        <div className="p-4">
                          <EmptyTableMessage />
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Código</TableHead>
                              <TableHead>Ordem</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead>Valor</TableHead>
                              <TableHead className="w-24" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scoresByGroup.get(group.id)?.map((score) => (
                              <TableRow key={score.id}>
                                <TableCell>{score.code}</TableCell>
                                <TableCell>{score.sort_order}</TableCell>
                                <TableCell>{score.score_type ?? "—"}</TableCell>
                                <TableCell>{score.description}</TableCell>
                                <TableCell>{score.value ?? "—"}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        openScoreDialog(group.id, score)
                                      }
                                    >
                                      Editar
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() =>
                                        startTransition(async () => {
                                          const result =
                                            await deleteAssessmentScoreAction(
                                              score.id
                                            );
                                          if (!result.success) {
                                            toast.error({
                                              title: "Falha ao excluir",
                                              description:
                                                result.error ??
                                                "Não foi possível excluir a pontuação.",
                                            });
                                            return;
                                          }
                                          toast.success({
                                            title: "Pontuação removida",
                                            description:
                                              "A pontuação foi excluída com sucesso.",
                                          });
                                          await reloadDetails();
                                        })
                                      }
                                    >
                                      <Trash2 className="size-4" aria-hidden />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-primary/30 text-primary hover:bg-primary/5"
                    onClick={handleCreateScoreGroup}
                  >
                    <Plus className="size-4" aria-hidden />
                    Novo grupo
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tarefas" className="mt-0 px-6 py-8 sm:px-8">
            <EmptyTableMessage />
            <p className="mt-4 text-sm text-muted-foreground">
              Cadastro de tarefas e testes será habilitado em uma próxima versão.
            </p>
          </TabsContent>
        </Tabs>

        {(error || successMessage) && (
          <div className="space-y-3 border-t border-border/60 px-6 py-4 sm:px-8">
            {error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {successMessage ? (
              <div className="rounded-lg border border-clinical-success/20 bg-clinical-success/5 px-4 py-3 text-sm text-clinical-success">
                {successMessage}
              </div>
            ) : null}
          </div>
        )}
      </section>

      <Dialog open={levelDialogOpen} onOpenChange={setLevelDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLevel ? "Editar Nível" : "Novo Nível"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="level-order">Ordem *</Label>
              <Input
                id="level-order"
                type="number"
                min={1}
                value={levelOrder}
                onChange={(event) => setLevelOrder(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="level-description">Descrição *</Label>
              <Input
                id="level-description"
                value={levelDescription}
                onChange={(event) => setLevelDescription(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="level-age-range">Faixa Etária</Label>
              <Input
                id="level-age-range"
                value={levelAgeRange}
                onChange={(event) => setLevelAgeRange(event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLevelDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-clinical-success text-white hover:bg-clinical-success/90"
              disabled={isPending}
              onClick={handleSaveLevel}
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSkill ? "Editar Habilidade" : "Nova Habilidade"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="skill-order">Ordem *</Label>
              <Input
                id="skill-order"
                type="number"
                min={1}
                value={skillOrder}
                onChange={(event) => setSkillOrder(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="skill-description">Descrição *</Label>
              <Input
                id="skill-description"
                value={skillDescription}
                onChange={(event) => setSkillDescription(event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSkillDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-clinical-success text-white hover:bg-clinical-success/90"
              disabled={isPending}
              onClick={handleSaveSkill}
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingScore ? "Editar Pontuação" : "Nova Pontuação"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="score-order">Ordem *</Label>
              <Input
                id="score-order"
                type="number"
                min={1}
                value={scoreOrder}
                onChange={(event) => setScoreOrder(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score-type">Tipo</Label>
              <Input
                id="score-type"
                value={scoreType}
                onChange={(event) => setScoreType(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="score-description">Descrição *</Label>
              <Input
                id="score-description"
                value={scoreDescription}
                onChange={(event) => setScoreDescription(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score-value">Valor</Label>
              <Input
                id="score-value"
                type="number"
                step="0.01"
                value={scoreValue}
                onChange={(event) => setScoreValue(event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setScoreDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-clinical-success text-white hover:bg-clinical-success/90"
              disabled={isPending}
              onClick={handleSaveScore}
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
