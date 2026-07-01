"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Building2, CheckCircle2, ImageIcon, Loader2, Upload } from "lucide-react";

import {
  uploadClinicLogoAction,
  upsertInstitutionalSettingsAction,
  type UpsertInstitutionalSettingsInput,
} from "@/app/actions/clinic-settings-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCnpjDisplay, type ClinicSettingsPublic } from "@/lib/clinic-settings";

type InstitutionalSettingsFormProps = {
  settings: ClinicSettingsPublic;
  onSettingsChange: (settings: ClinicSettingsPublic) => void;
};

const inputClassName = "h-11 w-full";

export function InstitutionalSettingsForm({
  settings,
  onSettingsChange,
}: InstitutionalSettingsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useAppToast();
  const [nomeClinica, setNomeClinica] = useState(settings.nomeClinica);
  const [cnpj, setCnpj] = useState(formatCnpjDisplay(settings.cnpj));
  const [enderecoCompleto, setEnderecoCompleto] = useState(
    settings.enderecoCompleto ?? ""
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isUploading, startUploadTransition] = useTransition();

  function handleCnpjChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    setCnpj(formatCnpjDisplay(digits));
  }

  function handleSave() {
    startSaveTransition(async () => {
      const payload: UpsertInstitutionalSettingsInput = {
        nomeClinica,
        cnpj,
        enderecoCompleto,
      };

      const result = await upsertInstitutionalSettingsAction(payload);

      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
        toast.error({
          title: "Falha ao salvar",
          description: result.error,
        });
        return;
      }

      if (result.data) {
        onSettingsChange(result.data);
        setNomeClinica(result.data.nomeClinica);
        setCnpj(formatCnpjDisplay(result.data.cnpj));
        setEnderecoCompleto(result.data.enderecoCompleto ?? "");
      }

      const message = result.message ?? "Dados salvos com sucesso.";
      setFeedback({ type: "success", message });
      toast.success({
        title: "Configurações salvas",
        description: "Dados institucionais atualizados com sucesso.",
      });
    });
  }

  function handleLogoUpload(file: File | null) {
    if (!file) {
      return;
    }

    startUploadTransition(async () => {
      const formData = new FormData();
      formData.append("logo", file);

      const result = await uploadClinicLogoAction(formData);

      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
        toast.error({
          title: "Falha no upload",
          description: result.error,
        });
        return;
      }

      if (result.data) {
        onSettingsChange(result.data);
      }

      const message = result.message ?? "Logo enviada com sucesso.";
      setFeedback({ type: "success", message });
      toast.success({
        title: "Logo atualizada",
        description: "A logo da clínica foi enviada.",
      });
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="size-5" aria-hidden />
          </div>
          <div className="space-y-1">
            <CardTitle>Dados Institucionais</CardTitle>
            <CardDescription>
              Informações exibidas em documentos e no cabeçalho dos PDFs
              gerados pelo sistema.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5">
        <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)]">
          <div className="space-y-3">
            <Label>Logo da clínica</Label>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/20">
              {settings.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt={`Logo ${settings.nomeClinica}`}
                  width={192}
                  height={192}
                  className="h-full w-full object-contain p-3"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground">
                  <ImageIcon className="size-8 opacity-60" aria-hidden />
                  Nenhuma logo enviada
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                handleLogoUpload(file);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="size-4" aria-hidden />
              )}
              {isUploading ? "Enviando..." : "Enviar logo"}
            </Button>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP ou SVG. Máximo de 5 MB.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Nome da clínica</Label>
              <Input
                id="clinic-name"
                className={inputClassName}
                value={nomeClinica}
                onChange={(event) => setNomeClinica(event.target.value)}
                placeholder="Ex.: Nurse Care"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-cnpj">CNPJ</Label>
              <Input
                id="clinic-cnpj"
                className={inputClassName}
                value={cnpj}
                onChange={(event) => handleCnpjChange(event.target.value)}
                placeholder="00.000.000/0000-00"
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-address">Endereço completo</Label>
              <Textarea
                id="clinic-address"
                value={enderecoCompleto}
                onChange={(event) => setEnderecoCompleto(event.target.value)}
                placeholder="Rua, número, bairro, cidade — UF, CEP"
                rows={4}
              />
            </div>
          </div>
        </div>

        {feedback ? (
          <div
            className={
              feedback.type === "success"
                ? "flex items-center gap-2 rounded-xl border border-clinical-success/30 bg-clinical-success/10 px-4 py-3 text-sm text-clinical-success"
                : "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            }
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            ) : null}
            <span>{feedback.message}</span>
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            {isSaving ? "Salvando..." : "Salvar dados institucionais"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
