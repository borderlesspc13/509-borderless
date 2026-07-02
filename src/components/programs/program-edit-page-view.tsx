"use client";

import { useState } from "react";
import Link from "next/link";

import { ProgramCriteriaTab } from "@/components/programs/program-criteria-tab";
import { ProgramEvolutionTab } from "@/components/programs/program-evolution-tab";
import { ProgramFilesTab } from "@/components/programs/program-files-tab";
import { ProgramGeneralTab } from "@/components/programs/program-general-tab";
import { ProgramInstructionsTab } from "@/components/programs/program-instructions-tab";
import { programTabTriggerClassName } from "@/components/programs/program-form-shared";
import { ProgramTargetsTab } from "@/components/programs/program-targets-tab";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProgramDetails } from "@/lib/program-format";
import type { PatientRow } from "@/lib/supabase/database.types";

type ProgramEditPageViewProps = {
  initialDetails: ProgramDetails;
  patients: PatientRow[];
};

export function ProgramEditPageView({
  initialDetails,
  patients,
}: ProgramEditPageViewProps) {
  const [details, setDetails] = useState(initialDetails);

  return (
    <PageContainer size="wide" className="space-y-8">
      <DashboardPageHeader
        title={details.program.name}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Programas", href: "/dashboard/programas" },
          { label: details.program.name },
        ]}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/programas" />}
          >
            Voltar
          </Button>
        }
      />

      <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <Tabs defaultValue="geral" className="gap-0">
          <div className="border-b border-border/60 bg-muted/25 px-4 py-4 sm:px-6">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:grid-cols-6">
              <TabsTrigger value="geral" className={programTabTriggerClassName}>
                Geral
              </TabsTrigger>
              <TabsTrigger value="instrucoes" className={programTabTriggerClassName}>
                Inst. para aplicação
              </TabsTrigger>
              <TabsTrigger value="alvos" className={programTabTriggerClassName}>
                Alvos/Estímulos
              </TabsTrigger>
              <TabsTrigger value="criterios" className={programTabTriggerClassName}>
                Critérios/Dicas
              </TabsTrigger>
              <TabsTrigger value="evolucao" className={programTabTriggerClassName}>
                Evolução/Correção
              </TabsTrigger>
              <TabsTrigger value="arquivos" className={programTabTriggerClassName}>
                Arquivos
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-4 py-6 sm:px-6">
            <TabsContent value="geral" className="mt-0">
              <ProgramGeneralTab
                details={details}
                patients={patients}
                onSaved={setDetails}
              />
            </TabsContent>
            <TabsContent value="instrucoes" className="mt-0">
              <ProgramInstructionsTab details={details} onSaved={setDetails} />
            </TabsContent>
            <TabsContent value="alvos" className="mt-0">
              <ProgramTargetsTab details={details} onSaved={setDetails} />
            </TabsContent>
            <TabsContent value="criterios" className="mt-0">
              <ProgramCriteriaTab details={details} onSaved={setDetails} />
            </TabsContent>
            <TabsContent value="evolucao" className="mt-0">
              <ProgramEvolutionTab details={details} onSaved={setDetails} />
            </TabsContent>
            <TabsContent value="arquivos" className="mt-0">
              <ProgramFilesTab details={details} onSaved={setDetails} />
            </TabsContent>
          </div>
        </Tabs>
      </section>
    </PageContainer>
  );
}
