import Link from "next/link";
import { Construction } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

type UnderDevelopmentPageViewProps = {
  title: string;
};

export function UnderDevelopmentPageView({
  title,
}: UnderDevelopmentPageViewProps) {
  return (
    <PageContainer size="default" className="space-y-8">
      <DashboardPageHeader
        title={title}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: title },
        ]}
      />

      <section className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Construction className="size-8" aria-hidden />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">
          Módulo em desenvolvimento
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          A tela <span className="font-medium text-foreground">{title}</span>{" "}
          ainda está sendo construída e estará disponível em breve.
        </p>
        <Button
          className="mt-8"
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          Voltar ao início
        </Button>
      </section>
    </PageContainer>
  );
}
