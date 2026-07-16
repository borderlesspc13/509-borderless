import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import type { UserProfile } from "@/lib/auth";
import { ROLES, isRole, normalizeRole } from "@/lib/rbac";
import { mapUserProfileRow, type AppUserSession } from "@/lib/user-profile";
import type { UserProfileRow } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function isValidProfile(value: unknown): value is UserProfile {
  return typeof value === "string" && isRole(normalizeRole(value));
}

async function ensureUserProfile(
  user: User
): Promise<UserProfileRow | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: existing } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { count, error: masterCountError } = await supabase
    .from("user_profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_master", true);

  if (masterCountError) {
    return null;
  }

  const hasMaster = (count ?? 0) > 0;
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : (user.email?.split("@")[0] ?? "Usuário");

  const profile: UserProfile = hasMaster
    ? isValidProfile(metadata.profile)
      ? normalizeRole(metadata.profile)
      : ROLES.RECEPCAO
    : ROLES.ADMIN;

  const { data: inserted, error: insertError } = await supabase
    .from("user_profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      profile,
      is_master: !hasMaster,
    })
    .select("*")
    .single();

  if (insertError) {
    return null;
  }

  return inserted;
}

type ResolvedServerAuth =
  | { status: "ok"; session: AppUserSession }
  | { status: "no-supabase" }
  | { status: "unauthenticated" }
  | { status: "no-profile" };

const resolveServerAuth = cache(async (): Promise<ResolvedServerAuth> => {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { status: "no-supabase" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  let profile = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()
    .then(({ data }) => data);

  if (!profile) {
    profile = await ensureUserProfile(user);
  }

  if (!profile) {
    return { status: "no-profile" };
  }

  return { status: "ok", session: mapUserProfileRow(user, profile) };
});

export const getServerUserSession = cache(
  async (): Promise<AppUserSession | null> => {
    const result = await resolveServerAuth();
    return result.status === "ok" ? result.session : null;
  }
);

export async function requireServerUserSession() {
  const result = await resolveServerAuth();

  if (result.status === "no-supabase" || result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "no-profile") {
    redirect("/login?erro=perfil-pendente");
  }

  return result.session;
}
