"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileStack, Pencil, Plus, Trash2, ToggleLeft } from "lucide-react";

import {
  deleteDocumentTemplateAction,
  toggleDocumentTemplateStatusAction,
} from "@/app/actions/document-template-actions";
import { AppSearchField } from "@/components/ui/app-search-field";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  documentTemplateCategories,
  documentTemplateStatusLabels,
  formatDocumentTemplateDate,
  getDocumentTemplateCategoryLabel,
} from "@/lib/document-template-format";
import type { DocumentTemplateRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type DocumentTemplateListProps = {
  templates: DocumentTemplateRow[];
  onTemplatesChange: (templates: DocumentTemplateRow[]) => void;
};

type StatusFilter = "all" | DocumentTemplateRow["status"];

const statusFilterItems = [
  { label: "Todos os status", value: "all" },
  ...Object.entries(documentTemplateStatusLabels).map(([value, label]) => ({
    label,
    value,
  })),
];

const categoryFilterItems = [
  { label: "Todas as categorias", value: "all" },
  ...documentTemplateCategories.map((category) => ({
    label: category.label,
    value: category.value,
  })),
];

export function DocumentTemplateList({
  templates,
  onTemplatesChange,
}: DocumentTemplateListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<DocumentTemplateRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        getDocumentTemplateCategoryLabel(template.category)
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" || template.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || template.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [templates, searchQuery, statusFilter, categoryFilter]);

  async function handleToggleStatus(template: DocumentTemplateRow) {
    setError(null);

    const result = await toggleDocumentTemplateStatusAction(template.id);

    if (!result.success || !result.data?.template) {
      setError(result.error ?? "Não foi possível alterar o status.");
      return;
    }

    onTemplatesChange(
      templates.map((item) =>
        item.id === template.id ? result.data!.template : item
      )
    );
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const result = await deleteDocumentTemplateAction(deleteTarget.id);

    setIsDeleting(false);

    if (!result.success) {
      setError(result.error ?? "Não foi possível excluir o modelo.");
      return;
    }

    onTemplatesChange(templates.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/dashboard/modelos/novo" />}
        >
          <Plus className="size-4" aria-hidden />
          Novo modelo
        </Button>
      </div>

      <section className="app-surface-card p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <AppSearchField
            id="template-search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nome ou categoria..."
          />

          <Select
            value={categoryFilter}
            items={categoryFilterItems}
            onValueChange={(value) => setCategoryFilter(value as string)}
          >
            <SelectTrigger className="h-10 w-full lg:w-52">
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

          <Select
            value={statusFilter}
            items={statusFilterItems}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="h-10 w-full lg:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statusFilterItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {filteredTemplates.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="Nenhum modelo encontrado"
          description="Crie modelos narrativos para agilizar a evolução clínica."
        />
      ) : (
        <div className="app-surface-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualizado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    {getDocumentTemplateCategoryLabel(template.category)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        template.status === "active" &&
                          "border-clinical-success/30 bg-clinical-success/10 text-clinical-success",
                        template.status === "inactive" &&
                          "border-destructive/30 bg-destructive/10 text-destructive"
                      )}
                    >
                      {documentTemplateStatusLabels[template.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDocumentTemplateDate(template.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Editar modelo"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/dashboard/modelos/${template.id}/editar`}
                          />
                        }
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Alternar status"
                        onClick={() => void handleToggleStatus(template)}
                      >
                        <ToggleLeft className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Excluir modelo"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(template)}
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

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir modelo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir &quot;{deleteTarget?.name}&quot;?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
