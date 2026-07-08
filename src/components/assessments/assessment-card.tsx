import Link from "next/link";
import { ClipboardList, Pencil, ToggleLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  assessmentTypeLabels,
  formatAssessmentDate,
  formatAssessmentDisplayValue,
  getAssessmentInitials,
  getAssessmentToggleActionLabel,
  assessmentStatusLabels,
} from "@/lib/assessment-format";
import { PEDI_TEMPLATE_NAME } from "@/lib/pedi";
import type { AssessmentTemplateRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type AssessmentCardProps = {
  template: AssessmentTemplateRow;
  onToggleStatus?: (template: AssessmentTemplateRow) => void;
};

function AssessmentStatusBadge({
  status,
}: {
  status: AssessmentTemplateRow["status"];
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide",
        status === "active" &&
          "border-clinical-success/30 bg-clinical-success/10 text-clinical-success",
        status === "inactive" &&
          "border-destructive/30 bg-destructive/10 text-destructive"
      )}
    >
      {assessmentStatusLabels[status]}
    </Badge>
  );
}

function AssessmentDetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function AssessmentCard({ template, onToggleStatus }: AssessmentCardProps) {
  const editHref = `/dashboard/avaliacoes/${template.id}/editar`;
  const toggleLabel = getAssessmentToggleActionLabel(template.status);
  const initials = getAssessmentInitials(template.name);
  const isPedi = template.name === PEDI_TEMPLATE_NAME;
  const actionCols = isPedi ? "grid-cols-3" : "grid-cols-2";

  return (
    <article className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-sm font-semibold text-muted-foreground">
            {initials}
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
              {template.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatAssessmentDate(template.updated_at)}
            </p>
          </div>
        </div>
        <AssessmentStatusBadge status={template.status} />
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
        <AssessmentDetailField
          label="Descrição"
          value={formatAssessmentDisplayValue(template.description)}
        />
        <AssessmentDetailField
          label="Tipo"
          value={assessmentTypeLabels[template.evaluation_type]}
        />
      </div>

      <div
        className={cn(
          "grid border-t border-border/60 bg-muted/20",
          actionCols
        )}
      >
        {isPedi ? (
          <Button
            variant="ghost"
            nativeButton={false}
            className="h-auto flex-col gap-1.5 rounded-none border-r border-border/60 px-2 py-3 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            render={<Link href="/dashboard/avaliacoes/pedi" />}
          >
            <ClipboardList className="size-4" aria-hidden />
            Aplicar
          </Button>
        ) : null}
        <Button
          variant="ghost"
          nativeButton={false}
          className="h-auto flex-col gap-1.5 rounded-none border-r border-border/60 px-2 py-3 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          render={<Link href={editHref} />}
        >
          <Pencil className="size-4" aria-hidden />
          Editar
        </Button>
        <Button
          variant="ghost"
          className="h-auto flex-col gap-1.5 rounded-none px-2 py-3 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          onClick={() => onToggleStatus?.(template)}
        >
          <ToggleLeft className="size-4" aria-hidden />
          {toggleLabel}
        </Button>
      </div>
    </article>
  );
}

export function AssessmentListRow({
  template,
  onToggleStatus,
}: AssessmentCardProps) {
  const editHref = `/dashboard/avaliacoes/${template.id}/editar`;
  const toggleLabel = getAssessmentToggleActionLabel(template.status);
  const initials = getAssessmentInitials(template.name);
  const isPedi = template.name === PEDI_TEMPLATE_NAME;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{template.name}</p>
            <AssessmentStatusBadge status={template.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Tipo: {assessmentTypeLabels[template.evaluation_type]}</span>
            <span>Atualizado: {formatAssessmentDate(template.updated_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isPedi ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/avaliacoes/pedi" />}
          >
            <ClipboardList className="size-4" aria-hidden />
            Aplicar
          </Button>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={editHref} />}
        >
          <Pencil className="size-4" aria-hidden />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus?.(template)}
        >
          <ToggleLeft className="size-4" aria-hidden />
          {toggleLabel}
        </Button>
      </div>
    </div>
  );
}
