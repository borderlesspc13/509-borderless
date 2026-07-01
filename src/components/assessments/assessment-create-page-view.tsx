"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Info, Plus } from "lucide-react";

import { saveAssessmentTemplateAction } from "@/app/actions/assessment-template-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  assessmentTypeOptions,
  type AssessmentEvaluationType,
} from "@/lib/assessment-format";
import { cn } from "@/lib/utils";

const inputClassName = "h-11 w-full";
const textareaClassName =
  "min-h-32 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const assessmentTabs = [
  { value: "geral", label: "Geral" },
  { value: "niveis", label: "Níveis" },
  { value: "habilidades", label: "Habilidades" },
  { value: "pontuacao", label: "Pontuação" },
  { value: "tarefas", label: "Tarefas/Testes" },
] as const;

function EmptyTableMessage() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
      <Info className="size-4 shrink-0" aria-hidden />
      Não há itens a serem exibidos.
    </div>
  );
}

export function AssessmentCreatePageView() {
  const router = useRouter();
  const toast = useAppToast();
  const [evaluationType, setEvaluationType] =
    useState<AssessmentEvaluationType>("acquisition");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function requireGeneralSave() {
    const message = 'Salve a aba "Geral" antes de cadastrar itens nesta seção.';
    setError(message);
    toast.warning({
      title: "Salve a aba Geral",
      description: message,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveAssessmentTemplateAction({
        name,
        description,
        evaluationType,
      });

      if (!result.success || !result.data?.template) {
        const message = result.error ?? "Não foi possível salvar a avaliação.";
        setError(message);
        toast.error({ title: "Falha ao criar avaliação", description: message });
        return;
      }

      toast.success({
        title: "Avaliação criada",
        description: "Continue configurando níveis e habilidades.",
      });

      router.push(`/dashboard/avaliacoes/${result.data.template.id}/editar`);
      router.refresh();
    });
  }

  return (
    <PageContainer size="wide" className="space-y-8">
      <DashboardPageHeader
        title="Nova Avaliação"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Avaliações", href: "/dashboard/avaliacoes" },
          { label: "Novo" },
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

      <form onSubmit={handleSubmit}>
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <Tabs defaultValue="geral" className="gap-0">
            <div className="border-b border-border/60 bg-muted/25 px-6 py-4 sm:px-8">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:grid-cols-5">
                {assessmentTabs.map((tab) => (
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
              <div className="mx-auto max-w-3xl space-y-6">
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
                          name="evaluation-type"
                          value={option.value}
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
                  <Label htmlFor="assessment-name">Nome *</Label>
                  <Input
                    id="assessment-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="assessment-description">Descrição</Label>
                  <textarea
                    id="assessment-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className={textareaClassName}
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  *Para persistir os dados da aba Geral, clique em &quot;Salvar&quot;
                </p>
              </div>
            </TabsContent>

            <TabsContent value="niveis" className="mt-0 px-6 py-8 sm:px-8">
              <div className="space-y-4">
                <Button type="button" onClick={requireGeneralSave}>
                  <Plus className="size-4" aria-hidden />
                  Novo Nível
                </Button>
                <EmptyTableMessage />
              </div>
            </TabsContent>

            <TabsContent value="habilidades" className="mt-0 px-6 py-8 sm:px-8">
              <div className="space-y-4">
                <Button type="button" onClick={requireGeneralSave}>
                  <Plus className="size-4" aria-hidden />
                  Nova Habilidade
                </Button>
                <EmptyTableMessage />
              </div>
            </TabsContent>

            <TabsContent value="pontuacao" className="mt-0 px-6 py-8 sm:px-8">
              <div className="space-y-4">
                <EmptyTableMessage />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-primary/30 text-primary hover:bg-primary/5"
                  onClick={requireGeneralSave}
                >
                  <Plus className="size-4" aria-hidden />
                  Novo grupo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tarefas" className="mt-0 px-6 py-8 sm:px-8">
              <EmptyTableMessage />
              <p className="mt-4 text-sm text-muted-foreground">
                Cadastro de tarefas e testes será habilitado em uma próxima versão.
              </p>
            </TabsContent>
          </Tabs>

          {error ? (
            <div className="border-t border-border/60 px-6 py-4 sm:px-8">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-border/60 px-6 py-5 sm:px-8">
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
        </section>
      </form>
    </PageContainer>
  );
}
