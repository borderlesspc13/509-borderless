import { ShieldCheck } from "lucide-react";

import { AppLogo } from "@/components/layout/app-logo";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className={cn("app-auth-card overflow-hidden", className)}>
      <div className="space-y-4 px-5 pt-7 text-center sm:px-6 sm:pt-8">
        <div className="flex justify-center">
          <AppLogo className="justify-center" />
        </div>
        <div className="space-y-1.5">
          <h1 className="app-screen-title">{title}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>

      {footer ? (
        <div className="flex flex-col gap-4 border-t border-border/60 px-5 py-5 sm:px-6">
          {footer}
        </div>
      ) : null}

      <div className="flex items-center justify-center gap-1.5 border-t border-border/60 px-5 py-3.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0 text-clinical-success" />
        <span>Conexão segura e criptografada</span>
      </div>
    </div>
  );
}
