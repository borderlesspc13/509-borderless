"use client";

import { useState, useTransition } from "react";
import { CalendarClock, CheckCircle2, Clock3, Info, Loader2 } from "lucide-react";

import { updateCompanySchedulingSettingsAction } from "@/app/actions/company-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  CompanyFormField,
  CompanySettingToggle,
  companyInputClassName,
} from "@/components/company/company-form-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CompanyProfile } from "@/lib/company-profile";

type CompanySettingsTabProps = {
  profile: CompanyProfile;
  onProfileChange: (profile: CompanyProfile) => void;
};

export function CompanySettingsTab({
  profile,
  onProfileChange,
}: CompanySettingsTabProps) {
  const toast = useAppToast();
  const [whatsappGuardianConfirmation, setWhatsappGuardianConfirmation] =
    useState(profile.whatsappGuardianConfirmation);
  const [whatsappProfessionalNotification, setWhatsappProfessionalNotification] =
    useState(profile.whatsappProfessionalNotification);
  const [appointmentNotificationHours, setAppointmentNotificationHours] =
    useState(String(profile.appointmentNotificationHours));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  function handleSave() {
    setError(null);

    const hours = Number.parseInt(appointmentNotificationHours, 10);

    startSaveTransition(async () => {
      const result = await updateCompanySchedulingSettingsAction({
        whatsappGuardianConfirmation,
        whatsappProfessionalNotification,
        appointmentNotificationHours: hours,
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar as configurações.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }

      if (result.data) {
        onProfileChange(result.data);
        setAppointmentNotificationHours(
          String(result.data.appointmentNotificationHours)
        );
      }

      toast.success({
        title: "Configurações salvas",
        description: "Preferências de agendamento atualizadas.",
      });
    });
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/25 px-5 py-3.5">
        <CalendarClock className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Agendamento</h3>
      </div>

      <div className="px-5">
        <CompanySettingToggle
          id="whatsapp-guardian"
          title="Enviar confirmação de agendamento via WhatsApp para o responsável pelo aprendiz"
          description="Quando ativado, o responsável pelo aprendiz receberá uma mensagem no WhatsApp após cada agendamento, podendo confirmar ou cancelar diretamente pelo aplicativo."
          checked={whatsappGuardianConfirmation}
          onCheckedChange={setWhatsappGuardianConfirmation}
        />

        <CompanySettingToggle
          id="whatsapp-professional"
          title="Notificar o profissional sobre confirmação ou cancelamento via WhatsApp"
          description="O profissional receberá uma mensagem no WhatsApp sempre que o aprendiz confirmar ou cancelar um agendamento. Esta notificação depende da opção acima estar habilitada."
          checked={whatsappProfessionalNotification}
          disabled={!whatsappGuardianConfirmation}
          onCheckedChange={setWhatsappProfessionalNotification}
        />

        <div className="flex flex-col gap-4 border-b border-border/60 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock3 className="size-4 text-primary" />
              Quantidade de horas antes do início do agendamento para envio da
              notificação
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Informe com quantas horas de antecedência o WhatsApp deve notificar
              sobre o agendamento (mínimo de 1 hora).
            </p>
          </div>
          <CompanyFormField id="notification-hours" label="Horas" className="w-full sm:w-28">
            <Input
              id="notification-hours"
              type="number"
              min={1}
              value={appointmentNotificationHours}
              onChange={(event) =>
                setAppointmentNotificationHours(event.target.value)
              }
              className={companyInputClassName}
            />
          </CompanyFormField>
        </div>
      </div>

      <div className="mx-5 mb-5 rounded-xl border border-border/60 bg-muted/20 px-4 py-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Regras de notificação:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Os agendamentos não serão notificados em dia de domingo.</li>
              <li>
                Os agendamentos começarão a ser notificados das 06:30 até 19:00.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mx-5 mb-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="border-t border-border/60 px-5 py-4">
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </section>
  );
}
