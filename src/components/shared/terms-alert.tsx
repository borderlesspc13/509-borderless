"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";

import { acceptTermAction } from "@/app/actions/terms-actions";
import { Button } from "@/components/ui/button";

type TermsAlertProps = {
  termType?: string;
  title?: string;
  initialNeedsAcceptance?: boolean;
};

export function TermsAlert({
  termType = "responsabilidade",
  title = "Termo de Responsabilidade",
  initialNeedsAcceptance = false,
}: TermsAlertProps) {
  const [isVisible, setIsVisible] = useState(initialNeedsAcceptance);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const result = await acceptTermAction(termType);
        if (result.success) {
          setIsVisible(false);
          return;
        }
        setErrorMessage(result.error || "Ocorreu um erro ao aceitar o termo.");
      } catch {
        setErrorMessage("Não foi possível aceitar o termo. Tente novamente.");
      }
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-xl border border-clinical-warning/30 bg-clinical-warning/10 p-4 shadow-lg backdrop-blur-md sm:bottom-8 sm:p-5">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-start gap-4 sm:items-center">
          <div className="rounded-full bg-clinical-warning/20 p-2 text-clinical-warning">
            <AlertTriangle className="size-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{title} pendente</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Você possui atualizações nos termos de uso e responsabilidade da
              plataforma. É necessário aceitá-los para continuar utilizando o
              sistema normalmente.
            </p>
          </div>
        </div>
        <div className="mt-4 flex shrink-0 items-center gap-3 sm:mt-0 sm:ml-6">
          <Button
            onClick={handleAccept}
            disabled={isPending}
            className="w-full bg-clinical-warning text-clinical-warning-foreground hover:bg-clinical-warning/90 sm:w-auto"
          >
            {isPending ? "Processando..." : "Li e aceito os termos"}
          </Button>
        </div>
      </div>
      {errorMessage ? (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
