import {
  formatPediAgeLabel,
  PEDI_AREA_LABELS,
  PEDI_NORMATIVE_MAX_AGE_MONTHS,
  type PediAreaScoreResult,
  type PediScoreResult,
} from "@/lib/pedi";
import { cn } from "@/lib/utils";

type PediScoreResultsProps = {
  scores: PediScoreResult;
  className?: string;
};

function formatScore(value: number | string | null) {
  if (value == null) {
    return "—";
  }

  if (typeof value === "number") {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  return value;
}

function formatStandardError(value: number | null) {
  if (value == null) {
    return "—";
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function isOutOfRange(value: number | string | null) {
  return typeof value === "string";
}

function ScoreTable({
  title,
  subtitle,
  rows,
  appliesNormative,
  footnote,
}: {
  title: string;
  subtitle?: string;
  rows: PediAreaScoreResult[];
  appliesNormative: boolean;
  footnote?: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card print:border-black">
      <div className="border-b border-border/60 bg-muted/30 px-4 py-3 print:bg-white">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
        {!appliesNormative ? (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            Idade acima de 7 anos: escore normativo não se aplica — apenas
            contínuo.
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/20 text-[0.7rem] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-semibold">Área</th>
              <th className="px-4 py-2.5 font-semibold">Escore bruto</th>
              <th className="px-4 py-2.5 font-semibold">Escore normativo</th>
              <th className="px-4 py-2.5 font-semibold">EP normativo</th>
              <th className="px-4 py-2.5 font-semibold">Escore contínuo</th>
              <th className="px-4 py-2.5 font-semibold">EP contínuo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((area) => (
              <tr
                key={area.area}
                className="border-b border-border/40 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {PEDI_AREA_LABELS[area.area]}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {area.rawScore}
                  <span className="text-xs"> / {area.maxRawScore}</span>
                </td>
                <td
                  className={cn(
                    "px-4 py-3 tabular-nums font-semibold",
                    isOutOfRange(area.normativeScore)
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-foreground"
                  )}
                >
                  {formatScore(area.normativeScore)}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {formatStandardError(area.normativeStandardError ?? null)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 tabular-nums font-semibold",
                    isOutOfRange(area.continuousScore)
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-foreground"
                  )}
                >
                  {formatScore(area.continuousScore)}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {formatStandardError(area.continuousStandardError ?? null)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="border-t border-border/60 px-4 py-2 text-[0.7rem] text-muted-foreground print:text-black">
        {footnote ??
          "EP = erro padrão. Valores com > 100 ou < 10 indicam escore fora da curva da tabela de conversão. Colunas de EP ficam \"—\" até o seed das tabelas oficiais do manual PEDI."}
      </p>
    </section>
  );
}

export function PediScoreResults({ scores, className }: PediScoreResultsProps) {
  const age = scores.age ?? {
    years: Math.floor(scores.ageMonths / 12),
    months: scores.ageMonths % 12,
    days: 0,
    totalMonths: scores.ageMonths,
  };
  const appliesNormative = age.totalMonths <= PEDI_NORMATIVE_MAX_AGE_MONTHS;

  return (
    <div className={cn("space-y-4", className)}>
      <ScoreTable
        title="Quadro 1 — Habilidades Funcionais (Parte I)"
        subtitle={`Idade na avaliação: ${formatPediAgeLabel(age)} (${age.totalMonths} meses)`}
        rows={scores.areas}
        appliesNormative={appliesNormative}
      />

      {scores.caregiverAreas && scores.caregiverAreas.length > 0 ? (
        <ScoreTable
          title="Quadro 1 — Assistência do cuidador (Parte II)"
          subtitle="Escores contínuos provisórios (proxy linear 0–100) até tabelas oficiais ASC."
          rows={scores.caregiverAreas}
          appliesNormative={appliesNormative}
          footnote="Parte II: escala 0–5 por item complexo. Contínuo/normativo provisórios até seed oficial."
        />
      ) : null}
    </div>
  );
}
