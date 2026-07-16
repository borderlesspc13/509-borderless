"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Home,
  Lightbulb,
  LineChart,
  Megaphone,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type {
  FamilyParentOrientation,
  FamilyPortalHomeData,
} from "@/app/actions/family-portal-actions";
import type { HomeActivity } from "@/app/actions/home-activity-actions";
import { FamilyPortalNav } from "@/components/family-portal/family-portal-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FamilyPortalProgressChart = dynamic(
  () =>
    import("@/components/family-portal/family-portal-progress-chart").then(
      (mod) => ({ default: mod.FamilyPortalProgressChart })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-lg bg-muted/60" aria-hidden />
    ),
  }
);

type FamilyPortalHomeProps = {
  data: FamilyPortalHomeData;
};

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function TrendBadge({ trend }: { trend: number | null }) {
  if (trend === null) {
    return (
      <Badge variant="secondary" className="h-6 font-normal">
        Tendência em formação
      </Badge>
    );
  }

  const isPositive = trend >= 0;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-6 gap-1 font-normal",
        isPositive
          ? "bg-clinical-success/12 text-clinical-success"
          : "bg-destructive/10 text-destructive"
      )}
    >
      {isPositive ? (
        <TrendingUp className="size-3" aria-hidden />
      ) : (
        <TrendingDown className="size-3" aria-hidden />
      )}
      {isPositive ? "+" : ""}
      {trend} pts no período
    </Badge>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 p-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function SectionPanel({
  id,
  title,
  description,
  icon,
  children,
  className,
}: {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-36 space-y-3", className)}
      aria-labelledby={`${id}-title`}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0 pt-0.5">
          <h2
            id={`${id}-title`}
            className="font-heading text-base font-semibold text-foreground"
          >
            {title}
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-[0_2px_12px_rgb(0_0_0_/_0.04)] sm:p-5">
        {children}
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-10 text-center text-sm leading-relaxed text-muted-foreground">
      {message}
    </p>
  );
}

function HomeActivityCard({ activity }: { activity: HomeActivity }) {
  return (
    <li className="rounded-xl border border-border/60 bg-muted/10 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          {activity.title}
        </h3>
        {activity.dueDateLabel ? (
          <Badge variant="outline" className="text-[10px]">
            Prazo: {activity.dueDateLabel}
          </Badge>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">
        {activity.description}
      </p>
      {activity.instructions ? (
        <p className="mt-3 rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm leading-relaxed text-muted-foreground">
          {activity.instructions}
        </p>
      ) : null}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Enviado por {activity.createdByName} · {activity.createdAtLabel}
      </p>
    </li>
  );
}

function OrientationCard({
  orientation,
}: {
  orientation: FamilyParentOrientation;
}) {
  return (
    <li className="rounded-xl border border-border/60 bg-muted/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          {orientation.title}
        </h3>
        <time
          dateTime={orientation.createdAt}
          className="shrink-0 text-[11px] font-medium text-muted-foreground"
        >
          {orientation.createdAtLabel}
        </time>
      </div>
      {orientation.contentHtml ? (
        <div
          className="prose prose-sm mt-2 max-w-none text-foreground/85 prose-p:my-1.5 prose-headings:my-2 prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: orientation.contentHtml }}
        />
      ) : null}
      {orientation.peiUrl ? (
        <a
          href={orientation.peiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <FileText className="size-4" aria-hidden />
          {orientation.peiLabel?.trim() || "Abrir PEI"}
        </a>
      ) : null}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Publicado por {orientation.authorName}
      </p>
    </li>
  );
}

export function FamilyPortalHome({ data }: FamilyPortalHomeProps) {
  const {
    patient,
    evolutionPoints,
    scoreTrend,
    notices,
    homeActivities,
    parentOrientations,
  } = data;
  const [activeSection, setActiveSection] = useState("resumo");

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(sectionId);
  }, []);

  useEffect(() => {
    const sectionIds = [
      "resumo",
      "orientacoes",
      "progresso",
      "atividades-casa",
      "avisos",
    ] as const;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-40% 0px -45% 0px",
        threshold: [0.1, 0.35, 0.6],
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const evaluationCount = evolutionPoints.length;
  const orientationCount = parentOrientations.length;

  return (
    <div className="space-y-6">
      <FamilyPortalNav
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      <section
        id="resumo"
        className="scroll-mt-36 overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-md"
      >
        <div className="relative px-5 py-6 sm:px-6 sm:py-7">
          <div
            className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-white/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-12 right-16 size-24 rounded-full bg-white/5"
            aria-hidden
          />

          <div className="relative flex items-start gap-4">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold backdrop-blur-sm"
              aria-hidden
            >
              {getInitials(patient.full_name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/75">
                Acompanhamento terapêutico
              </p>
              <h1 className="mt-1 font-heading text-2xl font-semibold leading-tight sm:text-[1.65rem]">
                {patient.full_name}
              </h1>
              {patient.diagnosis ? (
                <p className="mt-1.5 text-sm text-primary-foreground/90">
                  {patient.diagnosis}
                </p>
              ) : null}
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard
              label="Orientações"
              value={String(orientationCount)}
              hint="Da equipe"
            />
            <StatCard
              label="Avaliações"
              value={String(evaluationCount)}
              hint="Com pontuação"
            />
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-primary-foreground/75">
                Tendência
              </p>
              <p className="mt-1 text-sm font-semibold">
                {scoreTrend === null
                  ? "—"
                  : `${scoreTrend >= 0 ? "+" : ""}${scoreTrend} pts`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-5">
        <SectionPanel
          id="orientacoes"
          title="Orientações da equipe"
          description="Estratégias e demandas para reforçar o desenvolvimento em casa."
          icon={<Lightbulb className="size-4" aria-hidden />}
          className="lg:order-1"
        >
          {parentOrientations.length === 0 ? (
            <EmptyState message="Nenhuma orientação publicada no momento." />
          ) : (
            <ul className="space-y-3">
              {parentOrientations.map((orientation) => (
                <OrientationCard
                  key={orientation.id}
                  orientation={orientation}
                />
              ))}
            </ul>
          )}
        </SectionPanel>

        <SectionPanel
          id="progresso"
          title="Gráfico de progresso"
          description="Evolução das pontuações nas avaliações finalizadas."
          icon={<LineChart className="size-4" aria-hidden />}
          className="lg:order-2"
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <TrendBadge trend={scoreTrend} />
            </div>
            <FamilyPortalProgressChart points={evolutionPoints} />
          </div>
        </SectionPanel>
      </div>

      <SectionPanel
        id="atividades-casa"
        title="Atividades para casa"
        description="Exercícios e orientações enviados pela psicopedagoga para continuidade em casa."
        icon={<Home className="size-4" aria-hidden />}
      >
        {homeActivities.length === 0 ? (
          <EmptyState message="Nenhuma atividade publicada no momento." />
        ) : (
          <ul className="space-y-3">
            {homeActivities.map((activity) => (
              <HomeActivityCard key={activity.id} activity={activity} />
            ))}
          </ul>
        )}
      </SectionPanel>

      <SectionPanel
        id="avisos"
        title="Avisos e recados"
        description="Comunicados da clínica para a família."
        icon={<Megaphone className="size-4" aria-hidden />}
      >
        {notices.length === 0 ? (
          <EmptyState message="Nenhum aviso publicado no momento." />
        ) : (
          <ul className="space-y-3">
            {notices.map((notice, index) => (
              <li
                key={notice.id}
                className="relative rounded-xl border border-border/60 bg-muted/10 p-4 pl-5"
              >
                <span
                  className="absolute bottom-4 left-0 top-4 w-1 rounded-full bg-primary/60"
                  aria-hidden
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {notice.title}
                  </h3>
                  <time
                    dateTime={notice.createdAt}
                    className="shrink-0 text-[11px] font-medium text-muted-foreground"
                  >
                    {notice.createdAtLabel}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                  {notice.content}
                </p>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  {notice.authorName}
                  {index === 0 ? (
                    <Badge variant="outline" className="ml-2 h-5 text-[10px]">
                      Mais recente
                    </Badge>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>

      <p className="pb-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        Visualização somente leitura — acompanhe a evolução com segurança.
      </p>
    </div>
  );
}
