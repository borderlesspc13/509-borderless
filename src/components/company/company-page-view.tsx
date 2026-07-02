"use client";

import { useState } from "react";

import { CompanyAccreditationTab } from "@/components/company/company-accreditation-tab";
import { CompanyDataTab } from "@/components/company/company-data-tab";
import { CompanySettingsTab } from "@/components/company/company-settings-tab";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CompanyProfile } from "@/lib/company-profile";

type CompanyPageViewProps = {
  initialProfile: CompanyProfile;
};

export function CompanyPageView({ initialProfile }: CompanyPageViewProps) {
  const [profile, setProfile] = useState(initialProfile);

  return (
    <PageContainer size="wide" className="space-y-8">
      <DashboardPageHeader
        title="Minha Empresa"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Minha Empresa" },
        ]}
      />

      <Tabs defaultValue="dados" className="gap-6">
        <TabsList className="flex !h-12 w-full max-w-3xl items-stretch gap-1 rounded-2xl bg-muted p-1">
          <TabsTrigger
            value="dados"
            className="h-full min-h-0 flex-1 rounded-xl border-0 px-4 py-0 text-xs font-bold tracking-wide uppercase data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none sm:text-sm"
          >
            Dados da Empresa
          </TabsTrigger>
          <TabsTrigger
            value="configuracoes"
            className="h-full min-h-0 flex-1 rounded-xl border-0 px-4 py-0 text-xs font-bold tracking-wide uppercase data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none sm:text-sm"
          >
            Configurações
          </TabsTrigger>
          <TabsTrigger
            value="credenciamento"
            className="h-full min-h-0 flex-1 rounded-xl border-0 px-4 py-0 text-xs font-bold tracking-wide uppercase data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none sm:text-sm"
          >
            Credenciamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-0">
          <CompanyDataTab profile={profile} onProfileChange={setProfile} />
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-0">
          <CompanySettingsTab profile={profile} onProfileChange={setProfile} />
        </TabsContent>

        <TabsContent value="credenciamento" className="mt-0">
          <CompanyAccreditationTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
