import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import {
  canAccessRoute,
  getAccessDeniedRedirectPath,
  FAMILIA_HOME_PATH,
  RECEPCAO_HOME_PATH,
  ROLES,
  normalizeRole,
} from "@/lib/rbac";

const protectedPrefixes = [
  "/dashboard",
  "/agenda",
  "/agenda-convencional",
  "/chat",
  "/prontuario",
  "/paciente",
  "/evolucao",
  "/configuracoes",
  "/portal-familia",
  "/em-desenvolvimento",
] as const;

function isProtectedRoute(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next({ request });
  }

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

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("profile, is_master")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    const normalizedProfile = normalizeRole(profile.profile);

    if (
      normalizedProfile === ROLES.FAMILIA &&
      !pathname.startsWith("/portal-familia")
    ) {
      const portalUrl = request.nextUrl.clone();
      portalUrl.pathname = FAMILIA_HOME_PATH;
      portalUrl.search = "";
      return NextResponse.redirect(portalUrl);
    }

    if (normalizedProfile === ROLES.RECEPCAO && pathname === "/dashboard") {
      const agendaUrl = request.nextUrl.clone();
      agendaUrl.pathname = RECEPCAO_HOME_PATH;
      agendaUrl.search = "";
      return NextResponse.redirect(agendaUrl);
    }

    if (!canAccessRoute(pathname, normalizedProfile, profile.is_master)) {
      const deniedPath = getAccessDeniedRedirectPath(normalizedProfile);
      const deniedUrl = request.nextUrl.clone();
      const [redirectPath, redirectSearch] = deniedPath.split("?");
      deniedUrl.pathname = redirectPath;
      deniedUrl.search = redirectSearch ?? "";
      return NextResponse.redirect(deniedUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/agenda/:path*",
    "/agenda-convencional/:path*",
    "/chat/:path*",
    "/prontuario/:path*",
    "/paciente/:path*",
    "/evolucao/:path*",
    "/configuracoes/:path*",
    "/portal-familia/:path*",
    "/em-desenvolvimento/:path*",
  ],
};
