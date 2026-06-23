import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ChatDbClient = SupabaseClient<Database>;

export async function getChatDbContext() {
  await requirePermission(PERMISSIONS.INTERNAL_MESSAGING);

  const readClient = await createServerSupabaseClient();

  if (!readClient) {
    throw new Error("Supabase não configurado.");
  }

  const {
    data: { user },
    error,
  } = await readClient.auth.getUser();

  if (error || !user) {
    throw new Error("Sessão inválida.");
  }

  const writeClient = createAdminSupabaseClient() ?? readClient;

  return {
    readClient,
    writeClient,
    userId: user.id,
  };
}

export async function assertConversationMember(
  client: ChatDbClient,
  conversationId: string,
  userId: string
) {
  const { data, error } = await client
    .from("chat_conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Você não participa desta conversa.");
  }
}
