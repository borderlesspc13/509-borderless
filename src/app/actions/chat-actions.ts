"use server";

import { requirePermission } from "@/lib/auth-guard";
import {
  buildConversationSummaries,
  buildDirectPairKey,
  mapChatMemberPreview,
  type ChatConversationSummary,
  type ChatMemberPreview,
  type ChatMessageWithSender,
} from "@/lib/chat";
import {
  assertConversationMember,
  getChatDbContext,
  type ChatDbClient,
} from "@/lib/chat-db";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  ChatConversationRow,
  ChatMessageRow,
  UserProfileRow,
} from "@/lib/supabase/database.types";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function requireChatAccess() {
  await requirePermission(PERMISSIONS.INTERNAL_MESSAGING);
}

async function getAuthenticatedUserId(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Sessão inválida.");
  }

  return user.id;
}

async function loadProfilesMap(supabase: ChatDbClient, userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, UserProfileRow>();
  }

  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .in("id", userIds);

  return new Map((data ?? []).map((profile) => [profile.id, profile]));
}

async function loadPresenceMap(supabase: ChatDbClient, userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, string>();
  }

  const { data } = await supabase
    .from("user_presence")
    .select("user_id, last_seen_at")
    .in("user_id", userIds);

  return new Map(
    (data ?? []).map((row) => [row.user_id, row.last_seen_at])
  );
}

export async function listChatUsersAction(): Promise<
  ActionResult<{ users: ChatMemberPreview[] }>
> {
  await requireChatAccess();

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const currentUserId = await getAuthenticatedUserId(supabase);

  const { data: profiles, error } = await supabase
    .from("user_profiles")
    .select("id, full_name, profile")
    .eq("status", "active")
    .neq("id", currentUserId)
    .order("full_name");

  if (error) {
    return { success: false, error: error.message };
  }

  const presenceMap = await loadPresenceMap(
    supabase,
    (profiles ?? []).map((profile) => profile.id)
  );

  const users = (profiles ?? []).map((profile) =>
    mapChatMemberPreview({
      id: profile.id,
      full_name: profile.full_name,
      profile: profile.profile,
      role: "member",
      last_seen_at: presenceMap.get(profile.id),
    })
  );

  users.sort((left, right) => {
    if (left.isOnline !== right.isOnline) {
      return left.isOnline ? -1 : 1;
    }

    return left.fullName.localeCompare(right.fullName, "pt-BR");
  });

  return { success: true, data: { users } };
}

export async function listConversationsAction(): Promise<
  ActionResult<{ conversations: ChatConversationSummary[] }>
> {
  await requireChatAccess();

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const currentUserId = await getAuthenticatedUserId(supabase);

  const { data: memberships, error: membershipsError } = await supabase
    .from("chat_conversation_members")
    .select("conversation_id, last_read_at, role, user_id")
    .eq("user_id", currentUserId);

  if (membershipsError) {
    return { success: false, error: membershipsError.message };
  }

  const conversationIds = (memberships ?? []).map(
    (membership) => membership.conversation_id
  );

  if (conversationIds.length === 0) {
    return { success: true, data: { conversations: [] } };
  }

  const { data: conversations, error: conversationsError } = await supabase
    .from("chat_conversations")
    .select("*")
    .in("id", conversationIds);

  if (conversationsError) {
    return { success: false, error: conversationsError.message };
  }

  const { data: allMembers, error: membersError } = await supabase
    .from("chat_conversation_members")
    .select("conversation_id, user_id, role")
    .in("conversation_id", conversationIds);

  if (membersError) {
    return { success: false, error: membersError.message };
  }

  const memberUserIds = Array.from(
    new Set((allMembers ?? []).map((member) => member.user_id))
  );

  const profilesMap = await loadProfilesMap(supabase, memberUserIds);
  const presenceMap = await loadPresenceMap(supabase, memberUserIds);

  const membersByConversation = new Map<string, ChatMemberPreview[]>();

  for (const member of allMembers ?? []) {
    const profile = profilesMap.get(member.user_id);

    if (!profile) {
      continue;
    }

    const preview = mapChatMemberPreview({
      id: profile.id,
      full_name: profile.full_name,
      profile: profile.profile,
      role: member.role,
      last_seen_at: presenceMap.get(profile.id),
    });

    const current = membersByConversation.get(member.conversation_id) ?? [];
    current.push(preview);
    membersByConversation.set(member.conversation_id, current);
  }

  const { data: recentMessages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })
    .limit(200);

  if (messagesError) {
    return { success: false, error: messagesError.message };
  }

  const messagesByConversation = new Map<string, ChatMessageRow>();

  for (const message of recentMessages ?? []) {
    if (!messagesByConversation.has(message.conversation_id)) {
      messagesByConversation.set(message.conversation_id, message);
    }
  }

  const { data: allMessages, error: allMessagesError } = await supabase
    .from("chat_messages")
    .select("conversation_id, sender_id, created_at")
    .in("conversation_id", conversationIds);

  if (allMessagesError) {
    return { success: false, error: allMessagesError.message };
  }

  const unreadCountsByConversation = new Map<string, number>();

  for (const membership of memberships ?? []) {
    const lastReadAt = new Date(membership.last_read_at);
    const unreadCount = (allMessages ?? []).filter(
      (message) =>
        message.conversation_id === membership.conversation_id &&
        message.sender_id !== currentUserId &&
        new Date(message.created_at) > lastReadAt
    ).length;

    unreadCountsByConversation.set(membership.conversation_id, unreadCount);
  }

  const summaries = buildConversationSummaries({
    conversations: (conversations ?? []) as ChatConversationRow[],
    memberships: memberships ?? [],
    membersByConversation,
    messagesByConversation,
    unreadCountsByConversation,
    currentUserId,
  });

  return { success: true, data: { conversations: summaries } };
}

export async function getOrCreateDirectConversationAction(
  otherUserId: string
): Promise<ActionResult<{ conversationId: string }>> {
  try {
    const { writeClient, userId } = await getChatDbContext();

    if (otherUserId === userId) {
      return {
        success: false,
        error: "Não é possível iniciar chat consigo mesmo.",
      };
    }

    const directPairKey = buildDirectPairKey(userId, otherUserId);

    const { data: existing, error: existingError } = await writeClient
      .from("chat_conversations")
      .select("id")
      .eq("direct_pair_key", directPairKey)
      .maybeSingle();

    if (existingError) {
      return { success: false, error: existingError.message };
    }

    if (existing) {
      const { error: membersError } = await writeClient
        .from("chat_conversation_members")
        .upsert(
          [
            {
              conversation_id: existing.id,
              user_id: userId,
              role: "owner",
            },
            {
              conversation_id: existing.id,
              user_id: otherUserId,
              role: "member",
            },
          ],
          { onConflict: "conversation_id,user_id", ignoreDuplicates: true }
        );

      if (membersError) {
        return { success: false, error: membersError.message };
      }

      return { success: true, data: { conversationId: existing.id } };
    }

    const { data: conversation, error: conversationError } = await writeClient
      .from("chat_conversations")
      .insert({
        type: "direct",
        direct_pair_key: directPairKey,
        created_by: userId,
      })
      .select("id")
      .single();

    if (conversationError || !conversation) {
      return {
        success: false,
        error: conversationError?.message ?? "Falha ao criar conversa.",
      };
    }

    const { error: ownerError } = await writeClient
      .from("chat_conversation_members")
      .insert({
        conversation_id: conversation.id,
        user_id: userId,
        role: "owner",
      });

    if (ownerError) {
      return { success: false, error: ownerError.message };
    }

    const { error: memberError } = await writeClient
      .from("chat_conversation_members")
      .insert({
        conversation_id: conversation.id,
        user_id: otherUserId,
        role: "member",
      });

    if (memberError) {
      return { success: false, error: memberError.message };
    }

    return { success: true, data: { conversationId: conversation.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao criar conversa.",
    };
  }
}

export async function createGroupConversationAction(input: {
  name: string;
  memberIds: string[];
}): Promise<ActionResult<{ conversationId: string }>> {
  try {
    const { writeClient, userId } = await getChatDbContext();
    const trimmedName = input.name.trim();
    const uniqueMemberIds = Array.from(
      new Set(input.memberIds.filter((memberId) => memberId !== userId))
    );

    if (!trimmedName) {
      return { success: false, error: "Informe o nome do grupo." };
    }

    if (uniqueMemberIds.length === 0) {
      return {
        success: false,
        error: "Selecione pelo menos um participante para o grupo.",
      };
    }

    const { data: conversation, error: conversationError } = await writeClient
      .from("chat_conversations")
      .insert({
        type: "group",
        name: trimmedName,
        created_by: userId,
      })
      .select("id")
      .single();

    if (conversationError || !conversation) {
      return {
        success: false,
        error: conversationError?.message ?? "Falha ao criar grupo.",
      };
    }

    const { error: ownerError } = await writeClient
      .from("chat_conversation_members")
      .insert({
        conversation_id: conversation.id,
        user_id: userId,
        role: "owner",
      });

    if (ownerError) {
      return { success: false, error: ownerError.message };
    }

    const memberRows = uniqueMemberIds.map((memberUserId) => ({
      conversation_id: conversation.id,
      user_id: memberUserId,
      role: "member" as const,
    }));

    const { error: membersError } = await writeClient
      .from("chat_conversation_members")
      .insert(memberRows);

    if (membersError) {
      return { success: false, error: membersError.message };
    }

    return { success: true, data: { conversationId: conversation.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao criar grupo.",
    };
  }
}

export async function listConversationMessagesAction(
  conversationId: string
): Promise<ActionResult<{ messages: ChatMessageWithSender[] }>> {
  await requireChatAccess();

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const currentUserId = await getAuthenticatedUserId(supabase);

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    return { success: false, error: error.message };
  }

  const senderIds = Array.from(
    new Set((messages ?? []).map((message) => message.sender_id))
  );

  const profilesMap = await loadProfilesMap(supabase, senderIds);

  const enriched: ChatMessageWithSender[] = (messages ?? []).map((message) => {
    const profile = profilesMap.get(message.sender_id);

    return {
      ...message,
      senderName: profile?.full_name ?? "Usuário",
      senderProfile: profile?.profile ?? "AT1",
      isOwn: message.sender_id === currentUserId,
    };
  });

  return { success: true, data: { messages: enriched } };
}

export async function sendChatMessageAction(
  conversationId: string,
  content: string
): Promise<ActionResult<{ message: ChatMessageRow }>> {
  try {
    const { readClient, writeClient, userId } = await getChatDbContext();
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return { success: false, error: "A mensagem não pode estar vazia." };
    }

    await assertConversationMember(readClient, conversationId, userId);

    const { data, error } = await writeClient
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: trimmedContent,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message ?? "Falha ao enviar mensagem." };
    }

    return { success: true, data: { message: data } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao enviar mensagem.",
    };
  }
}

export async function markConversationReadAction(
  conversationId: string
): Promise<ActionResult> {
  try {
    const { readClient, writeClient, userId } = await getChatDbContext();
    const now = new Date().toISOString();

    await assertConversationMember(readClient, conversationId, userId);

    const { error } = await writeClient
      .from("chat_conversation_members")
      .update({ last_read_at: now })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Falha ao marcar conversa como lida.",
    };
  }
}

export async function sendDirectChatMessageToUserAction(
  receiverId: string,
  content: string
): Promise<ActionResult<{ message: ChatMessageRow; conversationId: string }>> {
  const conversationResult = await getOrCreateDirectConversationAction(receiverId);

  if (!conversationResult.success) {
    return {
      success: false,
      error: conversationResult.error ?? "Falha ao abrir conversa.",
    };
  }

  if (!conversationResult.data) {
    return { success: false, error: "Falha ao abrir conversa." };
  }

  const messageResult = await sendChatMessageAction(
    conversationResult.data.conversationId,
    content
  );

  if (!messageResult.success) {
    return {
      success: false,
      error: messageResult.error ?? "Falha ao enviar mensagem.",
    };
  }

  if (!messageResult.data) {
    return { success: false, error: "Falha ao enviar mensagem." };
  }

  return {
    success: true,
    data: {
      message: messageResult.data.message,
      conversationId: conversationResult.data.conversationId,
    },
  };
}

export async function addGroupMembersAction(input: {
  conversationId: string;
  memberIds: string[];
}): Promise<ActionResult> {
  try {
    const { readClient, writeClient, userId } = await getChatDbContext();
    const uniqueMemberIds = Array.from(new Set(input.memberIds));

    const { data: membership } = await readClient
      .from("chat_conversation_members")
      .select("role")
      .eq("conversation_id", input.conversationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!membership || membership.role !== "owner") {
      return {
        success: false,
        error: "Somente o criador do grupo pode adicionar participantes.",
      };
    }

    const { data: existingMembers } = await readClient
      .from("chat_conversation_members")
      .select("user_id")
      .eq("conversation_id", input.conversationId);

    const existingIds = new Set(
      (existingMembers ?? []).map((member) => member.user_id)
    );

    const newMemberIds = uniqueMemberIds.filter(
      (memberId) => !existingIds.has(memberId)
    );

    if (newMemberIds.length === 0) {
      return { success: false, error: "Todos os participantes já estão no grupo." };
    }

    const { error } = await writeClient.from("chat_conversation_members").insert(
      newMemberIds.map((memberId) => ({
        conversation_id: input.conversationId,
        user_id: memberId,
        role: "member" as const,
      }))
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Falha ao adicionar participantes ao grupo.",
    };
  }
}
