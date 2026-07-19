import {
  formatDemucaPercent,
  type DemucaScoreResult,
} from "@/lib/demuca";
import { cn } from "@/lib/utils";

type DemucaScoreCardProps = {
  scores: DemucaScoreResult;
  className?: string;
};

export function DemucaScoreCard({ scores, className }: DemucaScoreCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card",
        className
      )}
    >
      <div className="bg-muted/30 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Escore geral DEMUCA
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
          {formatDemucaPercent(scores.overallScore)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Média dos escores finais das categorias
          {scores.allowPartial ? " (avaliação parcial)" : ""}
        </p>
      </div>

      <div className="grid gap-4 border-b border-border/60 px-5 py-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Escore bruto</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {scores.rawScore}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Possível</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {scores.possibleScore}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Itens respondidos</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {scores.answeredCount}/{scores.itemCount}
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {scores.domains.map((domain) => (
          <div
            key={domain.domainId}
            className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {domain.domainLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                {domain.rawScore}/{domain.possibleScore} ·{" "}
                {domain.answeredCount}/{domain.itemCount} itens
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {domain.possibleScore > 0
                ? formatDemucaPercent(domain.finalScore)
                : "—"}
            </p>
          </div>
        ))}
      </div>

      <p className="border-t border-border/60 px-5 py-2 text-[0.7rem] text-muted-foreground">
        Escala DEMUCA 2.0 (Oliveira, Freire &amp; Parizzi). Escore final da
        categoria = bruto ÷ possível. Itens com peso x2 e comportamentos
        restritivos usam pontuação invertida.
      </p>
    </section>
  );
}
