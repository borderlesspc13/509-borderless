"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { TeamMember } from "@/app/actions/team-actions";
import { ProfessionalList } from "@/components/team/professional-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfissionaisPageViewProps = {
  professionals: TeamMember[];
  error?: string;
};

type ProfessionalsTab = "profissionais" | "equipe";

function resolveTab(value: string | null): ProfessionalsTab {
  return value === "equipe" ? "equipe" : "profissionais";
}

export function ProfissionaisPageView({
  professionals,
  error,
}: ProfissionaisPageViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = resolveTab(searchParams.get("aba"));

  function handleTabChange(value: string | null) {
    const nextTab = resolveTab(value);
    const params = new URLSearchParams(searchParams.toString());

    if (nextTab === "equipe") {
      params.set("aba", "equipe");
    } else {
      params.delete("aba");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title={
          activeTab === "equipe" ? "Equipe terapêutica" : "Profissionais"
        }
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          {
            label: "Profissionais",
            href: "/dashboard/profissionais",
          },
          ...(activeTab === "equipe"
            ? [{ label: "Equipe terapêutica" as const }]
            : []),
        ]}
      />

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="space-y-5">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="gap-0"
          >
            <TabsList variant="line" className="w-full justify-start gap-1">
              <TabsTrigger value="profissionais" className="px-4">
                Profissionais
              </TabsTrigger>
              <TabsTrigger value="equipe" className="px-4">
                Equipe terapêutica
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === "equipe" ? (
            <p className="max-w-2xl text-sm text-muted-foreground">
              Vincule aprendizes a cada profissional da equipe multidisciplinar.
              Use Equipe terapêutica no card do profissional para gerenciar os
              vínculos.
            </p>
          ) : null}

          <ProfessionalList
            professionals={professionals}
            mode={activeTab === "equipe" ? "equipe" : "cadastro"}
          />
        </div>
      )}
    </PageContainer>
  );
}
