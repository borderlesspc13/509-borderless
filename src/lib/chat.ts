import type {
  ChatConversationRow,
  ChatMessageRow,
} from "@/lib/supabase/database.types";
import { isUserOnline } from "@/lib/internal-communication";
import { getProfileLabel } from "@/lib/user-profile";
import type { UserProfile } from "@/lib/auth";

export type ChatMemberPreview = {
  id: string;
  fullName: string;
  profile: string;
  profileLabel: string;
  isOnline: boolean;
  role: "owner" | "member";
};

export type ChatConversationSummary = {
  id: string;
  type: "direct" | "group";
  displayName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  members: ChatMemberPreview[];
  updatedAt: string;
};

export type ChatMessageWithSender = ChatMessageRow & {
  senderName: string;
  senderProfile: string;
  isOwn: boolean;
};

export function buildDirectPairKey(userId1: string, userId2: string) {
  return [userId1, userId2].sort().join(":");
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatChatTime(isoDate: string) {
  const date = new Date(isoDate);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 7) {
    return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatMessageTimestamp(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function buildConversationSummaries(input: {
  conversations: ChatConversationRow[];
  memberships: Array<{
    conversation_id: string;
    last_read_at: string;
    role: "owner" | "member";
    user_id: string;
  }>;
  membersByConversation: Map<string, ChatMemberPreview[]>;
  messagesByConversation: Map<string, ChatMessageRow>;
  unreadCountsByConversation: Map<string, number>;
  currentUserId: string;
}): ChatConversationSummary[] {
  const membershipByConversation = new Map(
    input.memberships.map((membership) => [
      membership.conversation_id,
      membership,
    ])
  );

  return input.conversations
    .map((conversation) => {
      const members = input.membersByConversation.get(conversation.id) ?? [];
      const lastMessage = input.messagesByConversation.get(conversation.id);
      const unreadCount =
        input.unreadCountsByConversation.get(conversation.id) ?? 0;

      const displayName =
        conversation.type === "group"
          ? conversation.name ?? "Grupo"
          : (members.find((member) => member.id !== input.currentUserId)
              ?.fullName ?? "Conversa");

      return {
        id: conversation.id,
        type: conversation.type,
        displayName,
        lastMessage: lastMessage?.content ?? null,
        lastMessageAt: lastMessage?.created_at ?? conversation.updated_at,
        unreadCount,
        members,
        updatedAt: conversation.updated_at,
      };
    })
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
}

export function mapChatMemberPreview(input: {
  id: string;
  full_name: string;
  profile: string;
  role: "owner" | "member";
  last_seen_at?: string | null;
}): ChatMemberPreview {
  return {
    id: input.id,
    fullName: input.full_name,
    profile: input.profile,
    profileLabel: getProfileLabel(input.profile as UserProfile),
    isOnline: input.last_seen_at ? isUserOnline(input.last_seen_at) : false,
    role: input.role,
  };
}

export function groupMessagesByDate(messages: ChatMessageWithSender[]) {
  const groups = new Map<string, ChatMessageWithSender[]>();

  for (const message of messages) {
    const key = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(message.created_at));

    const current = groups.get(key) ?? [];
    current.push(message);
    groups.set(key, current);
  }

  return Array.from(groups.entries());
}
