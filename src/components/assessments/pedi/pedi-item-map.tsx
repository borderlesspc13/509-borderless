import { PEDI_AREA_LABELS, PEDI_AREAS, getPediDomainGroups } from "@/lib/pedi";
import type { PediCapability } from "@/lib/pedi";
import { cn } from "@/lib/utils";

type PediItemMapProps = {
  items: Record<string, PediCapability>;
  className?: string;
};

function cellClass(value: PediCapability | undefined) {
  if (value === 1) {
    return "bg-clinical-success print:bg-clinical-success";
  }

  if (value === 0) {
    return "bg-destructive/20 print:bg-destructive/40";
  }

  return "bg-muted print:bg-muted";
}

export function PediItemMap({ items, className }: PediItemMapProps) {
  return (
    <section
      className={cn(
        "space-y-6 rounded-xl border border-border/70 bg-card p-4 print:border-black print:bg-white print:p-2",
        className
      )}
      aria-label="Mapa visual de itens PEDI"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 print:mb-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Mapa de itens (Functional Skills)
          </h3>
          <p className="text-xs text-muted-foreground print:text-black">
            Verde = realiza (1) · Vermelho claro = não realiza (0). Mapa Rasch
            (eixo 0–100 + linha de capacidade) entra na Fase 3.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground print:text-black">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-clinical-success" aria-hidden />
            1
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-destructive/20" aria-hidden />
            0
          </span>
        </div>
      </header>

      <div className="space-y-8 print:space-y-6">
        {PEDI_AREAS.map((area) => {
          const domains = getPediDomainGroups(area);

          return (
            <div
              key={area}
              className="break-inside-avoid space-y-3 print:break-before-page print:first:break-before-auto"
            >
              <h4 className="border-b border-border/60 pb-1 text-xs font-bold uppercase tracking-wide text-foreground print:border-black print:text-black">
                {PEDI_AREA_LABELS[area]}
              </h4>

              <div className="space-y-3">
                {domains.map((domain) => (
                  <div key={`${area}-${domain.domainCode}`} className="space-y-1.5">
                    <p className="text-[0.7rem] font-medium text-muted-foreground print:text-black">
                      {domain.domainCode}. {domain.domainLabel}
                    </p>
                    <div
                      className="grid gap-1"
                      style={{
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(1.1rem, 1fr))",
                      }}
                      role="list"
                      aria-label={`${PEDI_AREA_LABELS[area]} — ${domain.domainLabel}`}
                    >
                      {domain.items.map((item) => {
                        const value = items[item.id];

                        return (
                          <span
                            key={item.id}
                            role="listitem"
                            title={`${item.sortOrder}. ${item.text}: ${value === 1 ? "1" : "0"}`}
                            aria-label={`${item.sortOrder}. ${item.text}: ${value === 1 ? "realiza" : "não realiza"}`}
                            className={cn(
                              "flex aspect-square items-center justify-center rounded-[2px] border border-black/5 text-[0.5rem] font-semibold tabular-nums text-foreground/80 print:border-black/30",
                              cellClass(value)
                            )}
                          >
                            {item.sortOrder}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
