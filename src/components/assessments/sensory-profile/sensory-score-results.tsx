import {
  SENSORY_AGE_BAND_LABELS,
  SENSORY_QUADRANT_LABELS,
  type SensoryProfileScoreResult,
} from "@/lib/sensory-profile";
import { cn } from "@/lib/utils";

type SensoryScoreResultsProps = {
  scores: SensoryProfileScoreResult;
  className?: string;
};

function classificationTone(classification: string) {
  if (classification === "typical") {
    return "text-clinical-success";
  }
  if (classification === "probable_difference") {
    return "text-amber-700 dark:text-amber-400";
  }
  return "text-destructive";
}

function classificationBadgeClass(classification: string) {
  if (classification === "typical") {
    return "border-clinical-success/30 bg-clinical-success/10 text-clinical-success";
  }
  if (classification === "probable_difference") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  }
  return "border-destructive/30 bg-destructive/10 text-destructive";
}

export function SensoryScoreResults({
  scores,
  className,
}: SensoryScoreResultsProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card",
        className
      )}
    >
      <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Resultado — Perfil Sensorial II
        </h3>
        <p className="text-xs text-muted-foreground">
          Faixa etária:{" "}
          <span className="font-medium text-foreground">
            {SENSORY_AGE_BAND_LABELS[scores.ageBand]}
          </span>
          {scores.ageMonths !== null ? (
            <>
              {" "}
              · Idade:{" "}
              <span className="font-medium text-foreground">
                {scores.ageMonths} meses
              </span>
            </>
          ) : null}
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {scores.quadrants.map((quadrant) => (
          <article
            key={quadrant.quadrant}
            className="rounded-lg border border-border/60 bg-muted/10 p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                {SENSORY_QUADRANT_LABELS[quadrant.quadrant]}
              </h4>
              <span
                className={cn(
                  "shrink-0 rounded-md border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide",
                  classificationBadgeClass(quadrant.classification)
                )}
              >
                {quadrant.classificationLabel}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <div>
                <dt className="text-muted-foreground">Escore bruto</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {quadrant.rawScore}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Média normativa</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {quadrant.meanScore.toLocaleString("pt-BR")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">DP</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {quadrant.sdScore.toLocaleString("pt-BR")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Z (desvio)</dt>
                <dd
                  className={cn(
                    "font-semibold tabular-nums",
                    classificationTone(quadrant.classification)
                  )}
                >
                  {quadrant.zScore.toLocaleString("pt-BR")}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <p className="border-t border-border/60 px-4 py-2 text-[0.7rem] text-muted-foreground">
        Classificação baseada no desvio em relação à média normativa (±1 DP =
        Provável; ≥2 DP = Clara). Tabelas atuais são ilustrativas.
      </p>
    </section>
  );
}
