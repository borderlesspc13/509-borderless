"use client";

import { useEffect, useMemo, useState } from "react";
import { FileStack, Loader2 } from "lucide-react";

import { listDocumentTemplatesAction } from "@/app/actions/document-template-actions";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  applyDocumentTemplate,
  documentTemplateCategories,
  getDocumentTemplateCategoryLabel,
  type DocumentTemplateVariables,
} from "@/lib/document-template-format";
import type { DocumentTemplateRow } from "@/lib/supabase/database.types";

type TemplateInsertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variables: DocumentTemplateVariables;
  onInsert: (html: string) => void;
};

export function TemplateInsertDialog({
  open,
  onOpenChange,
  variables,
  onInsert,
}: TemplateInsertDialogProps) {
  const toast = useAppToast();
  const [templates, setTemplates] = useState<DocumentTemplateRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categoryFilterItems = [
    { label: "Todas as categorias", value: "all" },
    ...documentTemplateCategories.map((category) => ({
      label: category.label,
      value: category.value,
    })),
  ];

  useEffect(() => {
    if (!open) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedId(null);
    setSearchQuery("");
    setCategoryFilter("all");

    void listDocumentTemplatesAction({ activeOnly: true }).then((result) => {
      if (!result.success) {
        const message = result.error ?? "Não foi possível carregar os modelos.";
        setError(message);
        toast.error({ title: "Falha ao carregar", description: message });
        setTemplates([]);
      } else {
        setTemplates(result.data?.templates ?? []);
      }

      setIsLoading(false);
    });
  }, [open]);

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        getDocumentTemplateCategoryLabel(template.category)
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "all" || template.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, categoryFilter]);

  const selectedTemplate = filteredTemplates.find(
    (template) => template.id === selectedId
  );

  function handleInsert() {
    if (!selectedTemplate) {
      return;
    }

    const resolvedHtml = applyDocumentTemplate(
      selectedTemplate.body_html,
      variables
    );

    onInsert(resolvedHtml);
    toast.success({
      title: "Modelo inserido",
      description: "O conteúdo foi adicionado ao editor.",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inserir modelo</DialogTitle>
          <DialogDescription>
            Selecione um modelo da biblioteca. Variáveis conhecidas serão
            preenchidas automaticamente; as demais permanecem destacadas para
            edição.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="template-search">Buscar</Label>
            <Input
              id="template-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Nome do modelo..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-category-filter">Categoria</Label>
            <Select
              value={categoryFilter}
              items={categoryFilterItems}
              onValueChange={(value) => setCategoryFilter(value as string)}
            >
              <SelectTrigger id="template-category-filter" className="w-full sm:w-52">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categoryFilterItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Carregando modelos...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
            <FileStack className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Nenhum modelo ativo disponível.
            </p>
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border/70 p-2">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedId(template.id)}
                className={
                  selectedId === template.id
                    ? "w-full rounded-lg border border-primary bg-primary/5 px-3 py-3 text-left"
                    : "w-full rounded-lg border border-transparent px-3 py-3 text-left hover:bg-muted/50"
                }
              >
                <p className="text-sm font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getDocumentTemplateCategoryLabel(template.category)}
                </p>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleInsert}
            disabled={!selectedTemplate}
          >
            Inserir no editor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
