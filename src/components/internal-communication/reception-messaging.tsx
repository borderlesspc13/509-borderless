"use client";

import { useState } from "react";
import { Circle, MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternalCommunication } from "@/contexts/internal-communication-context";
import { useAppToast } from "@/hooks/use-app-toast";
import { getProfileLabel } from "@/lib/user-profile";
import type { UserProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";

type ReceptionMessagingProps = {
  compact?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ReceptionMessaging({
  compact = false,
  open = false,
  onOpenChange,
}: ReceptionMessagingProps) {
  const { onlineProfessionals, sendMessage } = useInternalCommunication();
  const toast = useAppToast();
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const onlineOnly = onlineProfessionals.filter(
    (professional) => professional.isOnline
  );

  async function handleSend() {
    if (!selectedProfessionalId || !message.trim()) {
      return;
    }

    setIsSending(true);
    setFeedback(null);

    const success = await sendMessage(selectedProfessionalId, message.trim());

    setIsSending(false);

    if (success) {
      setMessage("");
      setFeedback("Mensagem enviada com sucesso.");
      toast.success({
        title: "Mensagem enviada",
        description: "Mensagem enviada ao profissional.",
      });
      onOpenChange?.(false);
    } else {
      setFeedback("Não foi possível enviar a mensagem.");
      toast.error({
        title: "Falha no envio",
        description: "Não foi possível enviar a mensagem.",
      });
    }
  }

  const professionalList = (
    <div className={cn("space-y-1", compact ? "max-h-32" : "max-h-48")}>
      {onlineOnly.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nenhum profissional online no momento.
        </p>
      ) : (
        onlineOnly.map((professional) => (
          <button
            key={professional.id}
            type="button"
            onClick={() => setSelectedProfessionalId(professional.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
              selectedProfessionalId === professional.id && "bg-muted"
            )}
          >
            <Circle
              className="size-2 fill-emerald-500 text-emerald-500"
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate font-medium">
              {professional.fullName}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {getProfileLabel(professional.profile as UserProfile)}
            </span>
          </button>
        ))
      )}
    </div>
  );

  if (compact) {
    return professionalList;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            Mensagem direta
          </DialogTitle>
          <DialogDescription>
            Selecione um profissional online e envie uma mensagem interna.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profissionais online</Label>
            {professionalList}
          </div>

          <div className="space-y-2">
            <Label htmlFor="internal-message">Mensagem</Label>
            <Input
              id="internal-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ex.: O paciente está pronto para atendimento."
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
          </div>

          {feedback ? (
            <p className="text-sm text-muted-foreground">{feedback}</p>
          ) : null}

          <Button
            type="button"
            className="w-full gap-2"
            disabled={
              !selectedProfessionalId || !message.trim() || isSending
            }
            onClick={() => void handleSend()}
          >
            <Send className="size-4" />
            {isSending ? "Enviando..." : "Enviar mensagem"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
