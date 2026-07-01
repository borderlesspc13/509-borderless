"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { createPatientAction } from "@/app/actions/patient-record-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inputClassName = "h-11 w-full";
const textareaClassName =
  "min-h-32 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function PatientCreatePageView() {
  const router = useRouter();
  const toast = useAppToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createPatientAction({
        fullName: String(formData.get("fullName") ?? ""),
        cpf: String(formData.get("cpf") ?? ""),
        guardianName: String(formData.get("guardianName") ?? ""),
        guardianPhone: String(formData.get("guardianPhone") ?? ""),
        guardianEmail: String(formData.get("guardianEmail") ?? ""),
        diagnosis: String(formData.get("diagnosis") ?? ""),
        birthDate: String(formData.get("birthDate") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível cadastrar o aprendiz.";
        setError(message);
        toast.error({ title: "Falha no cadastro", description: message });
        return;
      }

      const fullName = String(formData.get("fullName") ?? "");
      toast.success({
        title: "Aprendiz cadastrado",
        description: fullName
          ? `${fullName} foi adicionado com sucesso.`
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

      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 space-y-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <UserPlus className="size-5 text-primary" aria-hidden />
            Cadastrar aprendiz
          </h2>
          <p className="text-sm text-muted-foreground">
            Preencha os dados principais. Informações adicionais podem ser
            editadas depois.
          </p>
        </div>

        <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="full-name">Nome completo *</Label>
            <Input
              id="full-name"
              name="fullName"
              required
              className={inputClassName}
              placeholder="Nome do aprendiz"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              className={inputClassName}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth-date">Data de nascimento</Label>
            <Input
              id="birth-date"
              name="birthDate"
              type="date"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardian-name">Nome do responsável</Label>
            <Input
              id="guardian-name"
              name="guardianName"
              className={inputClassName}
              placeholder="Nome do responsável"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardian-phone">Telefone do responsável</Label>
            <Input
              id="guardian-phone"
              name="guardianPhone"
              className={inputClassName}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="guardian-email">E-mail do responsável</Label>
            <Input
              id="guardian-email"
              name="guardianEmail"
              type="email"
              className={inputClassName}
              placeholder="responsavel@email.com"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="diagnosis">Diagnóstico</Label>
            <Input
              id="diagnosis"
              name="diagnosis"
              className={inputClassName}
              placeholder="Ex.: TEA — Nível 2"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              name="notes"
              className={textareaClassName}
              placeholder="Informações complementares sobre o aprendiz"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive sm:col-span-2">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard/pacientes" />}
            >
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Cadastrando..." : "Cadastrar aprendiz"}
            </Button>
          </div>
        </form>
      </section>
    </PageContainer>
  );
}
