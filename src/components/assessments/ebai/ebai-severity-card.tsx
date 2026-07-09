import { EBAI_SEVERITY_LABELS, type EbaiScoreResult } from "@/lib/ebai";
import { cn } from "@/lib/utils";

type EbaiSeverityCardProps = {
  scores: EbaiScoreResult;
  className?: string;
};

function severityTone(classification: keyof typeof EBAI_SEVERITY_LABELS) {
  if (classification === "leve") {
    return {
      border: "border-clinical-success/40",
      bg: "bg-clinical-success/10",
      text: "text-clinical-success",
      badge: "border-clinical-success/30 bg-clinical-success/15 text-clinical-success",
    };
  }
  if (classification === "moderado") {
    return {
      border: "border-amber-500/40",
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-400",
      badge: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400",
    };
  }
  return {
    border: "border-destructive/40",
    bg: "bg-destructive/10",
    text: "text-destructive",
    badge: "border-destructive/30 bg-destructive/15 text-destructive",
  };
}

export function EbaiSeverityCard({ scores, className }: EbaiSeverityCardProps) {
  const tone = severityTone(scores.classification);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        tone.border,
        className
      )}
    >
      <div className={cn("px-5 py-4", tone.bg)}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Nível de severidade
        </p>
        <p className={cn("mt-1 text-2xl font-bold", tone.text)}>
          {scores.classificationLabel}
        </p>
      </div>

      <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Escore bruto</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {scores.rawScore}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Escore T</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {scores.tScore}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Itens respondidos</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {scores.answeredCount}/{scores.itemCount}
          </p>
        </div>
      </div>

      <p className="border-t border-border/60 px-5 py-2 text-[0.7rem] text-muted-foreground">
        Conversão via tabela normativa EBAI (escore bruto → Escore T). Tabela
        atual é ilustrativa — substituir pela oficial antes do uso clínico.
      </p>
    </section>
  );
}
