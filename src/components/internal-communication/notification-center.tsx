"use client";

import { useState } from "react";
import { Bell, Check, MessageSquare, UserRound } from "lucide-react";

import { ReceptionMessaging } from "@/components/internal-communication/reception-messaging";
import { Badge } from "@/components/ui/badge";
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
import { useInternalCommunication } from "@/contexts/internal-communication-context";
import { useUserRole } from "@/hooks/use-user-role";
import { cn } from "@/lib/utils";

function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "agora";
  }

  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `há ${diffHours}h`;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function NotificationCenter({ inverse = false }: { inverse?: boolean }) {
  const { canUseInternalMessaging } = useUserRole();
  const {
    notifications,
    unreadCount,
    isLoading,
    markNotificationRead,
  } = useInternalCommunication();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  const isReception = canUseInternalMessaging;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "relative size-10 shrink-0",
                inverse && "app-header-icon-btn"
              )}
              aria-label="Central de notificações"
            />
          }
        >
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[0.65rem] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 sm:w-96">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center justify-between gap-2">
              <span>Central de notificações</span>
              {unreadCount > 0 ? (
                <Badge variant="secondary">{unreadCount} nova(s)</Badge>
              ) : null}
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          {isReception ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsMessagingOpen(true)}>
                <MessageSquare className="size-4" />
                Enviar mensagem a profissional
              </DropdownMenuItem>
            </>
          ) : null}

          <DropdownMenuSeparator />

          {isLoading ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Carregando notificações...
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Nenhuma notificação no momento.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => {
                const isUnread = !notification.read_at;

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start gap-1 px-3 py-2.5",
                      isUnread && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (isUnread) {
                        void markNotificationRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-sm font-medium">
                          {notification.title}
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {notification.body}
                        </p>
                      </div>
                      {isUnread ? (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      ) : (
                        <Check className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-[0.65rem] text-muted-foreground">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}

          {isReception ? (
            <>
              <DropdownMenuSeparator />
              <div className="px-3 py-2">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <UserRound className="size-3.5" />
                  Profissionais online
                </p>
                <ReceptionMessaging compact />
              </div>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {isReception ? (
        <ReceptionMessaging
          open={isMessagingOpen}
          onOpenChange={setIsMessagingOpen}
        />
      ) : null}
    </>
  );
}
