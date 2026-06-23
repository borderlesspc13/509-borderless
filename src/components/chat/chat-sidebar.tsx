"use client";

import { MessageSquarePlus, Search, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/contexts/chat-context";
import { useUserRole } from "@/hooks/use-user-role";
import { formatChatTime, getInitials } from "@/lib/chat";
import { cn } from "@/lib/utils";

type ChatSidebarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onNewChat: () => void;
  onCreateGroup: () => void;
};

export function ChatSidebar({
  search,
  onSearchChange,
  onNewChat,
  onCreateGroup,
}: ChatSidebarProps) {
  const {
    conversations,
    activeConversationId,
    isLoadingConversations,
    selectConversation,
    totalUnreadCount,
  } = useChat();
  const { id: currentUserId } = useUserRole();

  const query = search.trim().toLowerCase();
  const filteredConversations = conversations.filter((conversation) =>
    conversation.displayName.toLowerCase().includes(query)
  );

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-card lg:w-80 xl:w-96">
      <div className="border-b border-border px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold">Chat Interno</h1>
            <p className="text-xs text-muted-foreground">
              {totalUnreadCount > 0
                ? `${totalUnreadCount} não lida(s)`
                : "Comunicação em tempo real"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Nova conversa"
              onClick={onNewChat}
            >
              <MessageSquarePlus className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Criar grupo"
              onClick={onCreateGroup}
            >
              <Users className="size-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar conversas..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoadingConversations ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            Carregando conversas...
          </p>
        ) : filteredConversations.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            {query
              ? "Nenhuma conversa encontrada."
              : "Inicie uma conversa ou crie um grupo."}
          </p>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const otherMember =
                conversation.type === "direct"
                  ? conversation.members.find(
                      (member) => member.id !== currentUserId
                    )
                  : null;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => void selectConversation(conversation.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                    isActive ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <Avatar size="default" className="relative">
                    <AvatarFallback
                      className={cn(
                        conversation.type === "group" && "bg-primary/15 text-primary"
                      )}
                    >
                      {conversation.type === "group" ? (
                        <Users className="size-4" />
                      ) : (
                        getInitials(conversation.displayName)
                      )}
                    </AvatarFallback>
                    {otherMember?.isOnline ? (
                      <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
                    ) : null}
                  </Avatar>

                  <span className="min-w-0 flex-1">
                    <span className="mb-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {conversation.displayName}
                      </span>
                      {conversation.lastMessageAt ? (
                        <span className="shrink-0 text-[0.65rem] text-muted-foreground">
                          {formatChatTime(conversation.lastMessageAt)}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-muted-foreground">
                        {conversation.lastMessage ?? "Sem mensagens ainda"}
                      </span>
                      {conversation.unreadCount > 0 ? (
                        <Badge className="h-5 min-w-5 justify-center px-1.5">
                          {conversation.unreadCount > 9
                            ? "9+"
                            : conversation.unreadCount}
                        </Badge>
                      ) : null}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
