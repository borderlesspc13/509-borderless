"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserRole } from "@/hooks/use-user-role";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  className?: string;
  inverse?: boolean;
};

export function UserMenu({ className, inverse = false }: UserMenuProps) {
  const { fullName, displayRole, initials } = useUserRole();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-10 rounded-lg p-0",
              inverse
                ? "app-header-icon-btn"
                : "rounded-full",
              className
            )}
            aria-label="Abrir menu do usuário"
            disabled={isPending}
          />
        }
      >
        <Avatar
          className={cn(
            "size-9 sm:size-10",
            inverse ? "ring-2 ring-white/30" : "ring-2 ring-primary/10"
          )}
        >
          <AvatarFallback
            className={cn(
              "text-xs font-semibold sm:text-sm",
              inverse
                ? "bg-white/20 text-primary-foreground"
                : "bg-primary/10 text-primary"
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{fullName}</span>
              <span className="text-xs text-muted-foreground">
                {displayRole}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="min-h-10 cursor-pointer"
          onClick={handleSignOut}
          disabled={isPending}
        >
          <LogOut className="size-4" aria-hidden />
          {isPending ? "Saindo..." : "Sair da plataforma"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
