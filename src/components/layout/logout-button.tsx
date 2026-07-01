"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  showIcon?: boolean;
};

export function LogoutButton({
  className,
  variant = "outline",
  showIcon = true,
}: LogoutButtonProps) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      toast.info({
        title: "Sessão encerrada",
        description: "Você saiu da plataforma com segurança.",
      });
      await signOut();
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={cn("h-11 w-full justify-start gap-2", className)}
      onClick={handleSignOut}
      disabled={isPending}
    >
      {showIcon ? <LogOut className="size-4" aria-hidden /> : null}
      {isPending ? "Saindo..." : "Sair da plataforma"}
    </Button>
  );
}
