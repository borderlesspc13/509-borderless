"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Send, Users } from "lucide-react";

import { CreateGroupDialog, NewChatDialog } from "@/components/chat/chat-dialogs";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/contexts/chat-context";
import { useUserRole } from "@/hooks/use-user-role";
import {
  formatMessageTimestamp,
  getInitials,
  groupMessagesByDate,
} from "@/lib/chat";
import { cn } from "@/lib/utils";

function ChatMessageBubble({
  content,
  senderName,
  timestamp,
  isOwn,
  showSender,
}: {
  content: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
  showSender: boolean;
}) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(100%,28rem)] rounded-2xl px-4 py-2.5 shadow-sm",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground"
        )}
      >
        {showSender ? (
          <p className="mb-1 text-xs font-semibold opacity-80">{senderName}</p>
        ) : null}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        <p
          className={cn(
            "mt-1 text-[0.65rem] opacity-70",
            isOwn ? "text-right" : "text-left"
          )}
        >
          {formatMessageTimestamp(timestamp)}
        </p>
      </div>
    </div>
  );
}

function ChatThread() {
  const {
    conversations,
    activeConversationId,
    activeMessages,
    isLoadingMessages,
    sendMessage,
    clearActiveConversation,
  } = useChat();
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const messageGroups = useMemo(
    () => groupMessagesByDate(activeMessages),
    [activeMessages]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeConversationId]);

  async function handleSend() {
    if (!draft.trim()) {
      return;
    }

    setIsSending(true);
    const success = await sendMessage(draft.trim());
    setIsSending(false);

    if (success) {
      setDraft("");
    }
  }

  if (!activeConversation) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-muted/20 px-6 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="size-8" />
        </div>
        <h2 className="text-lg font-semibold">Selecione uma conversa</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Escolha um chat na lista, inicie uma conversa privada ou crie um grupo
          com a equipe.
        </p>
      </div>
    );
  }

  const isGroup = activeConversation.type === "group";
  const onlineCount = activeConversation.members.filter(
    (member) => member.isOnline
  ).length;

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Voltar para conversas"
          onClick={clearActiveConversation}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Avatar>
          <AvatarFallback
            className={cn(isGroup && "bg-primary/15 text-primary")}
          >
            {isGroup ? (
              <Users className="size-4" />
            ) : (
              getInitials(activeConversation.displayName)
            )}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold">
            {activeConversation.displayName}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {isGroup
              ? `${activeConversation.members.length} participantes · ${onlineCount} online`
              : activeConversation.members.find((member) => member.isOnline)
                ? "Online agora"
                : "Offline"}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {isLoadingMessages ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Carregando mensagens...
          </p>
        ) : activeMessages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Envie a primeira mensagem.
          </p>
        ) : (
          <div className="space-y-6">
            {messageGroups.map(([dateLabel, messages]) => (
              <div key={dateLabel} className="space-y-3">
                <div className="flex justify-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-[0.65rem] font-medium text-muted-foreground">
                    {dateLabel}
                  </span>
                </div>
                {messages.map((message) => (
                  <ChatMessageBubble
                    key={message.id}
                    content={message.content}
                    senderName={message.senderName}
                    timestamp={message.created_at}
                    isOwn={message.isOwn}
                    showSender={isGroup && !message.isOwn}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <footer className="border-t border-border px-4 py-3 sm:px-6">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend();
          }}
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isSending}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !draft.trim()}
            aria-label="Enviar mensagem"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </footer>
    </section>
  );
}

export function ChatPageView() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { activeConversationId, selectConversation } = useChat();
  const initialConversationId = searchParams.get("conversation");

  useEffect(() => {
    if (initialConversationId && initialConversationId !== activeConversationId) {
      void selectConversation(initialConversationId);
    }
  }, [initialConversationId, activeConversationId, selectConversation]);

  return (
    <>
      <div className="-mx-4 -my-5 flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden sm:-mx-6 sm:-my-8 lg:-mx-8 lg:h-[calc(100dvh-4rem)]">
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div
            className={cn(
              "min-h-0 shrink-0",
              activeConversationId ? "hidden lg:flex" : "flex flex-1 lg:flex-none"
            )}
          >
            <ChatSidebar
              search={search}
              onSearchChange={setSearch}
              onNewChat={() => setIsNewChatOpen(true)}
              onCreateGroup={() => setIsCreateGroupOpen(true)}
            />
          </div>

          <div
            className={cn(
              "min-h-0 flex-1",
              !activeConversationId ? "hidden lg:flex" : "flex"
            )}
          >
            <ChatThread />
          </div>
        </div>
      </div>

      <NewChatDialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen} />
      <CreateGroupDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
      />
    </>
  );
}
