"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, MessageSquare } from "lucide-react";

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
import { getUnreadChatMessageCount } from "@/lib/internal-communication";
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

function getConversationIdFromMetadata(metadata: unknown) {
  if (
    typeof metadata === "object" &&
    metadata !== null &&
    "conversation_id" in metadata &&
    typeof metadata.conversation_id === "string"
  ) {
    return metadata.conversation_id;
  }

  return null;
}

export function NotificationCenter({ inverse = false }: { inverse?: boolean }) {
  const router = useRouter();
  const { canUseInternalMessaging } = useUserRole();
  const {
    notifications,
    unreadCount,
    isLoading,
    markNotificationRead,
  } = useInternalCommunication();

  const chatUnreadCount = getUnreadChatMessageCount(notifications);

  async function handleNotificationClick(
    notificationId: string,
    isUnread: boolean,
    conversationId: string | null
  ) {
    if (isUnread) {
      await markNotificationRead(notificationId);
    }

    if (conversationId && canUseInternalMessaging) {
      router.push(`/chat?conversation=${conversationId}`);
    }
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

        {canUseInternalMessaging ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/chat" />}>
              <MessageSquare className="size-4" />
              Abrir chat interno
              {chatUnreadCount > 0 ? (
                <Badge variant="secondary" className="ml-auto">
                  {chatUnreadCount}
                </Badge>
              ) : null}
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
              const conversationId = getConversationIdFromMetadata(
                notification.metadata
              );

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start gap-1 px-3 py-2.5",
                    isUnread && "bg-primary/5"
                  )}
                  onClick={() => {
                    void handleNotificationClick(
                      notification.id,
                      isUnread,
                      conversationId
                    );
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
