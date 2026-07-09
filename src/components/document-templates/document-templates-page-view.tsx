"use client";

import { useState } from "react";

import { DocumentTemplateList } from "@/components/document-templates/document-template-list";
import { AiWritingTrainingWidget } from "@/components/ai-writing-training/ai-writing-training-widget";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { documentTemplateCategories } from "@/lib/document-template-format";
import type { DocumentTemplateRow } from "@/lib/supabase/database.types";

type DocumentTemplatesPageViewProps = {
  templates: DocumentTemplateRow[];
  error?: string;
};

export function DocumentTemplatesPageView({
  templates: initialTemplates,
  error,
}: DocumentTemplatesPageViewProps) {
  const [templates, setTemplates] = useState(initialTemplates);

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="Biblioteca de Modelos"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Atendimento" },
          { label: "Biblioteca de Modelos" },
        ]}
      />

      <section className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
        Gerencie modelos narrativos reutilizáveis para evolução clínica e
        relatórios. Os terapeutas podem inserir modelos ativos diretamente no
        editor de evolução.
      </section>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <DocumentTemplateList
            templates={templates}
            onTemplatesChange={setTemplates}
          />

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              Treinamento IA por tipo de documento
            </h2>
            <div className="grid gap-4 xl:grid-cols-2">
              {documentTemplateCategories
                .filter((category) =>
                  ["relatorio", "parecer", "encaminhamento", "evolucao_clinica"].includes(
                    category.value
                  )
                )
                .map((category) => (
                  <AiWritingTrainingWidget
                    key={category.value}
                    trainingContextKey={category.label}
                  />
                ))}
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}
