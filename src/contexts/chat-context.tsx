"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  addGroupMembersAction,
  createGroupConversationAction,
  getOrCreateDirectConversationAction,
  listConversationMessagesAction,
  listConversationsAction,
  listChatUsersAction,
  markConversationReadAction,
  sendChatMessageAction,
} from "@/app/actions/chat-actions";
import type {
  ChatConversationSummary,
  ChatMemberPreview,
  ChatMessageWithSender,
} from "@/lib/chat";
import { setActiveChatConversationId } from "@/lib/chat-active-conversation";
import type { ChatMessageRow } from "@/lib/supabase/database.types";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type ChatContextValue = {
  conversations: ChatConversationSummary[];
  users: ChatMemberPreview[];
  activeConversationId: string | null;
  activeMessages: ChatMessageWithSender[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingUsers: boolean;
  totalUnreadCount: number;
  selectConversation: (conversationId: string) => Promise<void>;
  startDirectChat: (
    userId: string
  ) => Promise<{ conversationId: string | null; error: string | null }>;
  createGroup: (
    name: string,
    memberIds: string[]
  ) => Promise<{ conversationId: string | null; error: string | null }>;
  addGroupMembers: (conversationId: string, memberIds: string[]) => Promise<boolean>;
  sendMessage: (content: string) => Promise<boolean>;
  refreshConversations: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  clearActiveConversation: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

type ChatProviderProps = {
  children: React.ReactNode;
  userId: string;
};

function updateConversationPreview(
  conversations: ChatConversationSummary[],
  conversationId: string,
  message: ChatMessageRow,
  options?: { incrementUnread?: boolean }
) {
  return conversations.map((conversation) =>
    conversation.id === conversationId
      ? {
          ...conversation,
          lastMessage: message.content,
          lastMessageAt: message.created_at,
          updatedAt: message.created_at,
          unreadCount: options?.incrementUnread
            ? conversation.unreadCount + 1
            : conversation.unreadCount,
        }
      : conversation
  );
}

export function ChatProvider({ children, userId }: ChatProviderProps) {
  const [conversations, setConversations] = useState<ChatConversationSummary[]>(
    []
  );
  const [users, setUsers] = useState<ChatMemberPreview[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessageWithSender[]>(
    []
  );
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const activeConversationIdRef = useRef<string | null>(null);
  const conversationIdsRef = useRef<Set<string>>(new Set());

  const refreshConversations = useCallback(async () => {
    const result = await listConversationsAction();

    if (result.success && result.data) {
      setConversations(result.data.conversations);
      conversationIdsRef.current = new Set(
        result.data.conversations.map((item) => item.id)
      );
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    const result = await listChatUsersAction();

    if (result.success && result.data) {
      setUsers(result.data.users);
    }

    setIsLoadingUsers(false);
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    const result = await listConversationMessagesAction(conversationId);

    if (result.success && result.data) {
      setActiveMessages(result.data.messages);
    }

    await markConversationReadAction(conversationId);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
    setIsLoadingMessages(false);
  }, []);

  const selectConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId);
      await loadMessages(conversationId);
    },
    [loadMessages]
  );

  const clearActiveConversation = useCallback(() => {
    setActiveConversationId(null);
    setActiveMessages([]);
  }, []);

  const startDirectChat = useCallback(
    async (otherUserId: string) => {
      const result = await getOrCreateDirectConversationAction(otherUserId);

      if (!result.success) {
        return {
          conversationId: null,
          error: result.error ?? "Não foi possível iniciar a conversa.",
        };
      }

      if (!result.data) {
        return {
          conversationId: null,
          error: "Não foi possível iniciar a conversa.",
        };
      }

      await refreshConversations();
      await selectConversation(result.data.conversationId);
      return {
        conversationId: result.data.conversationId,
        error: null,
      };
    },
    [refreshConversations, selectConversation]
  );

  const createGroup = useCallback(
    async (name: string, memberIds: string[]) => {
      const result = await createGroupConversationAction({ name, memberIds });

      if (!result.success) {
        return {
          conversationId: null,
          error: result.error ?? "Não foi possível criar o grupo.",
        };
      }

      if (!result.data) {
        return {
          conversationId: null,
          error: "Não foi possível criar o grupo.",
        };
      }

      await refreshConversations();
      await selectConversation(result.data.conversationId);
      return {
        conversationId: result.data.conversationId,
        error: null,
      };
    },
    [refreshConversations, selectConversation]
  );

  const addGroupMembers = useCallback(
    async (conversationId: string, memberIds: string[]) => {
      const result = await addGroupMembersAction({ conversationId, memberIds });

      if (result.success) {
        await refreshConversations();
        return true;
      }

      return false;
    },
    [refreshConversations]
  );

  const appendMessage = useCallback(
    (message: ChatMessageRow, senderName: string, senderProfile: string) => {
      setActiveMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }

        return [
          ...current,
          {
            ...message,
            senderName,
            senderProfile,
            isOwn: message.sender_id === userId,
          },
        ];
      });
    },
    [userId]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId) {
        return false;
      }

      const result = await sendChatMessageAction(activeConversationId, content);

      if (result.success && result.data?.message) {
        const message = result.data.message;
        appendMessage(message, "Você", "ADMIN");
        setConversations((current) =>
          updateConversationPreview(current, activeConversationId, message)
        );
        return true;
      }

      return false;
    },
    [activeConversationId, appendMessage]
  );

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
    setActiveChatConversationId(activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      setIsLoadingConversations(true);
      await Promise.all([refreshConversations(), refreshUsers()]);

      if (isMounted) {
        setIsLoadingConversations(false);
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
      setActiveChatConversationId(null);
    };
  }, [refreshConversations, refreshUsers]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createBrowserSupabaseClient();

    const messagesChannel = supabase
      .channel(`team-chat-messages:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        async (payload) => {
          const message = payload.new as ChatMessageRow;

          if (!conversationIdsRef.current.has(message.conversation_id)) {
            await refreshConversations();
            return;
          }

          const activeId = activeConversationIdRef.current;

          if (message.conversation_id === activeId) {
            const profiles = await supabase
              .from("user_profiles")
              .select("full_name, profile")
              .eq("id", message.sender_id)
              .maybeSingle();

            appendMessage(
              message,
              profiles.data?.full_name ?? "Usuário",
              profiles.data?.profile ?? "AT1"
            );

            setConversations((current) =>
              updateConversationPreview(current, message.conversation_id, message)
            );

            if (message.sender_id !== userId) {
              void markConversationReadAction(message.conversation_id);
            }

            return;
          }

          if (message.sender_id !== userId) {
            setConversations((current) =>
              updateConversationPreview(current, message.conversation_id, message, {
                incrementUnread: true,
              })
            );
          } else {
            setConversations((current) =>
              updateConversationPreview(current, message.conversation_id, message)
            );
          }
        }
      )
      .subscribe();

    const conversationsChannel = supabase
      .channel(`team-chat-conversations:${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_conversations" },
        () => {
          void refreshConversations();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(messagesChannel);
      void supabase.removeChannel(conversationsChannel);
    };
  }, [userId, appendMessage, refreshConversations]);

  const totalUnreadCount = useMemo(
    () => conversations.reduce((sum, item) => sum + item.unreadCount, 0),
    [conversations]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      users,
      activeConversationId,
      activeMessages,
      isLoadingConversations,
      isLoadingMessages,
      isLoadingUsers,
      totalUnreadCount,
      selectConversation,
      startDirectChat,
      createGroup,
      addGroupMembers,
      sendMessage,
      refreshConversations,
      refreshUsers,
      clearActiveConversation,
    }),
    [
      conversations,
      users,
      activeConversationId,
      activeMessages,
      isLoadingConversations,
      isLoadingMessages,
      isLoadingUsers,
      totalUnreadCount,
      selectConversation,
      startDirectChat,
      createGroup,
      addGroupMembers,
      sendMessage,
      refreshConversations,
      refreshUsers,
      clearActiveConversation,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat deve ser usado dentro de ChatProvider.");
  }

  return context;
}
