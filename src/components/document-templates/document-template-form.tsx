"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Info } from "lucide-react";

import { saveDocumentTemplateAction } from "@/app/actions/document-template-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { RichTextEditor } from "@/components/clinical-evolution/rich-text-editor";
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
import {
  documentTemplateCategories,
  documentTemplateVariables,
} from "@/lib/document-template-format";
import type { DocumentTemplateRow } from "@/lib/supabase/database.types";

type DocumentTemplateFormProps = {
  template?: DocumentTemplateRow;
};

const inputClassName = "h-11 w-full";

const categorySelectItems = documentTemplateCategories.map((category) => ({
  label: category.label,
  value: category.value,
}));

export function DocumentTemplateForm({ template }: DocumentTemplateFormProps) {
  const router = useRouter();
  const toast = useAppToast();
  const isEditing = Boolean(template);
  const [name, setName] = useState(template?.name ?? "");
  const [category, setCategory] = useState(
    template?.category ?? documentTemplateCategories[0].value
  );
  const [bodyHtml, setBodyHtml] = useState(template?.body_html ?? "");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await saveDocumentTemplateAction({
        id: template?.id,
        name,
        category,
        bodyHtml,
        status: template?.status ?? "active",
      });

      if (!result.success || !result.data?.template) {
        const message = result.error ?? "Não foi possível salvar o modelo.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }

      if (isEditing) {
        setSuccessMessage("Modelo atualizado com sucesso.");
        toast.success({
          title: "Modelo atualizado",
          description: "As alterações foram salvas.",
        });
        router.refresh();
        return;
      }

      toast.success({
        title: "Modelo criado",
        description: "O modelo foi salvo na biblioteca.",
      });

      router.push(`/dashboard/modelos/${result.data.template.id}/editar`);
      router.refresh();
    });
  }

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title={isEditing ? "Editar modelo" : "Novo modelo"}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Atendimento" },
          { label: "Biblioteca de Modelos", href: "/dashboard/modelos" },
          { label: isEditing ? "Editar" : "Novo" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="grid gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="template-name">Nome do modelo</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Evolução ABA — sessão individual"
              className={inputClassName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-category">Categoria</Label>
            <Select
              value={category}
              items={categorySelectItems}
              onValueChange={(value) => setCategory(value as string)}
            >
              <SelectTrigger id="template-category" className={inputClassName}>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {documentTemplateCategories.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="space-y-2">
              <p>
                Use variáveis entre colchetes para campos preenchidos
                automaticamente na evolução clínica. Variáveis não reconhecidas
                permanecem destacadas para o terapeuta completar.
              </p>
              <p className="flex flex-wrap gap-2">
                {documentTemplateVariables.map((variable) => (
                  <code
                    key={variable.key}
                    className="rounded bg-background px-1.5 py-0.5 text-xs"
                  >
                    [{variable.key}]
                  </code>
                ))}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Conteúdo do modelo</h2>
            <p className="text-sm text-muted-foreground">
              Redija o texto base que será inserido no editor de evolução.
            </p>
          </div>
          <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
        </section>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex items-start gap-2 rounded-xl border border-clinical-success/20 bg-clinical-success/10 p-4 text-sm text-[oklch(0.42_0.1_155)]">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{successMessage}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            nativeButton={false}
            render={<Link href="/dashboard/modelos" />}
          >
            Voltar
          </Button>
          <Button type="submit" className="h-11" disabled={isPending}>
            {isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar modelo"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
