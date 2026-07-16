"use server";

import {
  getServerUserSession,
  requireServerUserSession,
} from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_TERM_TYPE = "responsabilidade";

function describeTermsError(error: {
  code?: string;
  message?: string;
}): string {
  if (error.code === "PGRST205" || error.message?.includes("user_terms")) {
    return "A tabela user_terms ainda não existe no Supabase. Rode a migration em supabase/migrations/20260713170000_user_terms.sql no SQL Editor do projeto.";
  }

  return "Falha ao aceitar o termo";
}

export async function hasUserAcceptedTerm(
  userId: string,
  termType: string = DEFAULT_TERM_TYPE
): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) return false;

  const { data, error } = await supabase
    .from("user_terms")
    .select("id")
    .eq("user_id", userId)
    .eq("term_type", termType)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error checking term:", error);
    return false;
  }

  return Boolean(data);
}

export async function checkTermAcceptedAction(
  termType: string = DEFAULT_TERM_TYPE
): Promise<boolean> {
  const session = await getServerUserSession();

  if (!session) return false;

  return hasUserAcceptedTerm(session.id, termType);
}

export async function acceptTermAction(termType: string = DEFAULT_TERM_TYPE) {
  const session = await requireServerUserSession();
  const supabase = await createServerSupabaseClient();

  if (!supabase) return { success: false, error: "Falha na conexão" };

  const { error } = await supabase.from("user_terms").insert({
    user_id: session.id,
    term_type: termType,
  });

  if (error) {
    console.error("Error accepting term:", error);
    return { success: false, error: describeTermsError(error) };
  }

  return { success: true };
}
