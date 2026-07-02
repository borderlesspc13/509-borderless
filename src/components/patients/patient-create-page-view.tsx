"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { createPatientAction } from "@/app/actions/patient-record-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import {
  PatientAdicionaisSection,
  PatientEnderecoSection,
  PatientGeralSection,
  formStateToActionInput,
} from "@/components/patients/patient-form-sections";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { emptyPatientFormState } from "@/lib/patient-form";

export function PatientCreatePageView() {
  const router = useRouter();
  const toast = useAppToast();
  const [values, setValues] = useState(emptyPatientFormState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange<K extends keyof typeof values>(
    field: K,
    value: (typeof values)[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createPatientAction(formStateToActionInput(values));

      if (!result.success) {
        const message = result.error ?? "Não foi possível cadastrar o aprendiz.";
        setError(message);
        toast.error({ title: "Falha no cadastro", description: message });
        return;
      }

      toast.success({
        title: "Aprendiz cadastrado",
        description: values.fullName
          ? `${values.fullName} foi adicionado com sucesso.`
          : "O aprendiz foi adicionado com sucesso.",
      });

      router.push("/dashboard/pacientes");
      router.refresh();
    });
  }

  return (
    <PageContainer size="wide" className="space-y-8">
      <DashboardPageHeader
        title="Novo Aprendiz"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Aprendizes", href: "/dashboard/pacientes" },
          { label: "Novo" },
        ]}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/pacientes" />}
          >
            Voltar
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/60 px-6 py-5 sm:px-8">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <UserPlus className="size-5 text-primary" aria-hidden />
                Cadastrar aprendiz
              </h2>
              <p className="text-sm text-muted-foreground">
                Apenas o nome é obrigatório. Os demais campos são opcionais e
                podem ser preenchidos agora ou depois.
              </p>
            </div>
          </div>

          <Tabs defaultValue="geral" className="gap-0">
            <div className="border-b border-border/60 bg-muted/25 px-6 py-4 sm:px-8">
              <TabsList className="grid h-auto w-full grid-cols-3 gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="geral"
                  className="rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground sm:text-sm"
                >
                  Geral
                </TabsTrigger>
                <TabsTrigger
                  value="adicionais"
                  className="rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground sm:text-sm"
                >
                  Info. Adicionais
                </TabsTrigger>
                <TabsTrigger
                  value="endereco"
                  className="rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground sm:text-sm"
                >
                  Endereço
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="geral" className="mt-0 px-6 py-8 sm:px-8">
              <PatientGeralSection
                values={values}
                onChange={handleChange}
                requireFullName
              />
            </TabsContent>

            <TabsContent value="adicionais" className="mt-0 px-6 py-8 sm:px-8">
              <PatientAdicionaisSection values={values} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="endereco" className="mt-0 px-6 py-8 sm:px-8">
              <PatientEnderecoSection values={values} onChange={handleChange} />
            </TabsContent>

            {error ? (
              <div className="border-t border-border/60 px-6 py-4 sm:px-8">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3 border-t border-border/60 px-6 py-5 sm:px-8">
              <Button
                type="button"
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<Link href="/dashboard/pacientes" />}
              >
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Cadastrando..." : "Cadastrar aprendiz"}
              </Button>
            </div>
          </Tabs>
        </section>
      </form>
    </PageContainer>
  );
}
