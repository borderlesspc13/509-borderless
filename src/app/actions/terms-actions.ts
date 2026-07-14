"use server";

import { requireServerUserSession } from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function checkTermAcceptedAction(termType: string): Promise<boolean> {
  const session = await requireServerUserSession();
  const supabase = await createServerSupabaseClient();
  
  if (!supabase) return false;

  const { data, error } = await (supabase as any)
    .from("user_terms")
    .select("id")
    .eq("user_id", session.id)
    .eq("term_type", termType)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error checking term:", error);
    return false;
  }

  return !!data;
}

export async function acceptTermAction(termType: string) {
  const session = await requireServerUserSession();
  const supabase = await createServerSupabaseClient();
  
  if (!supabase) return { success: false, error: "Falha na conexão" };

  const { error } = await (supabase as any)
    .from("user_terms")
    .insert({
      user_id: session.id,
      term_type: termType,
    });

  if (error) {
    console.error("Error accepting term:", error);
    return { success: false, error: "Falha ao aceitar o termo" };
  }

  return { success: true };
}
