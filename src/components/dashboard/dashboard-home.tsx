"use client";

import { useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { LearnerDashboardPanel } from "@/components/dashboard/learner-dashboard-panel";
import { ProfessionalDashboardPanel } from "@/components/dashboard/professional-dashboard-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDefaultDateRange } from "@/lib/dashboard-analytics-data";
import { PageContainer } from "@/components/layout/page-container";

export function DashboardHome() {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [activePanel, setActivePanel] = useState("learner");

  return (
    <PageContainer size="wide" className="space-y-7">
      <DashboardPageHeader
        title="Dashboard"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Dashboard" },
        ]}
      />

      <Tabs
        value={activePanel}
        onValueChange={setActivePanel}
        className="gap-6"
      >
        <TabsList className="flex !h-12 w-full max-w-3xl items-stretch gap-1 rounded-2xl bg-muted p-1">
          <TabsTrigger
            value="learner"
            className="h-full min-h-0 flex-1 rounded-xl border-0 px-4 py-0 text-xs font-bold tracking-wide uppercase data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none sm:text-sm"
          >
            Painel do Aprendiz
          </TabsTrigger>
          <TabsTrigger
            value="professional"
            className="h-full min-h-0 flex-1 rounded-xl border-0 px-4 py-0 text-xs font-bold tracking-wide uppercase data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none sm:text-sm"
          >
            Painel do Profissional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learner" className="mt-0">
          <LearnerDashboardPanel
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </TabsContent>

        <TabsContent value="professional" className="mt-0">
          <ProfessionalDashboardPanel
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
