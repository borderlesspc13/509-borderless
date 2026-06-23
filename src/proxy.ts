import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import {
  canAccessRoute,
  getAccessDeniedRedirectPath,
  RECEPCAO_HOME_PATH,
  ROLES,
  normalizeRole,
} from "@/lib/rbac";

const protectedPrefixes = [
  "/dashboard",
  "/agenda",
  "/chat",
  "/prontuario",
  "/paciente",
  "/evolucao",
  "/configuracoes",
];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedRoute && user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("profile, is_master")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      const normalizedProfile = normalizeRole(profile.profile);

      if (
        normalizedProfile === ROLES.RECEPCAO &&
        pathname === "/dashboard"
      ) {
        const agendaUrl = request.nextUrl.clone();
        agendaUrl.pathname = RECEPCAO_HOME_PATH;
        agendaUrl.search = "";
        return NextResponse.redirect(agendaUrl);
      }

      if (
        !canAccessRoute(pathname, normalizedProfile, profile.is_master)
      ) {
        const deniedPath = getAccessDeniedRedirectPath(normalizedProfile);
        const deniedUrl = request.nextUrl.clone();
        const [redirectPath, redirectSearch] = deniedPath.split("?");
        deniedUrl.pathname = redirectPath;
        deniedUrl.search = redirectSearch ?? "";
        return NextResponse.redirect(deniedUrl);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
