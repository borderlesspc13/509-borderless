"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  filterNavEntriesForProfile,
  isNavHrefActive,
  type NavEntry,
} from "@/lib/navigation";
import { useUserRole } from "@/hooks/use-user-role";
import { cn } from "@/lib/utils";

type DashboardNavProps = {
  onNavigate?: () => void;
};

function getHrefPath(href: string) {
  return href.split("?")[0] ?? href;
}

function getHrefSearchParams(href: string) {
  const queryIndex = href.indexOf("?");
  if (queryIndex === -1) {
    return null;
  }

  return new URLSearchParams(href.slice(queryIndex + 1));
}

function isNavItemActive(
  pathname: string,
  href: string,
  searchParams: URLSearchParams
) {
  if (href.startsWith("/em-desenvolvimento")) {
    const activeTitle = searchParams.get("titulo");
    return (
      pathname === "/em-desenvolvimento" &&
      activeTitle === getHrefSearchParams(href)?.get("titulo")
    );
  }

  const hrefPath = getHrefPath(href);
  const hrefParams = getHrefSearchParams(href);

  if (hrefPath === "/dashboard/profissionais") {
    const isProfessionalsPath =
      pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);

    if (!isProfessionalsPath) {
      return false;
    }

    const currentAba = searchParams.get("aba");
    const hrefAba = hrefParams?.get("aba") ?? null;

    if (hrefAba === "equipe") {
      return currentAba === "equipe";
    }

    return currentAba !== "equipe";
  }

  return isNavHrefActive(pathname, href);
}

function NavGroupSection({
  entry,
  pathname,
  onNavigate,
}: {
  entry: Extract<NavEntry, { kind: "group" }>;
  pathname: string;
  onNavigate?: () => void;
}) {
  const searchParams = useSearchParams();
  const hasActiveChild = entry.items.some((item) =>
    isNavItemActive(pathname, item.href, searchParams)
  );
  const [isOpen, setIsOpen] = useState(hasActiveChild);
  const Icon = entry.icon;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex min-h-11 w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors",
          isOpen || hasActiveChild
            ? "border-border bg-muted/50 text-foreground"
            : "border-transparent text-sidebar-foreground hover:border-border/70 hover:bg-muted/30"
        )}
        aria-expanded={isOpen}
      >
        <Icon className="size-5 shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">{entry.title}</span>
        {isOpen ? (
          <ChevronDown className="size-4 shrink-0" aria-hidden />
        ) : (
          <ChevronRight className="size-4 shrink-0" aria-hidden />
        )}
      </button>

      {isOpen ? (
        <div className="space-y-0.5 py-1 pl-11 pr-1">
          {entry.items.map((item) => {
            const isActive = isNavItemActive(pathname, item.href, searchParams);

            return (
              <Link
                key={`${entry.title}-${item.title}`}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded-lg px-2 py-2 text-sm transition-colors",
                  isActive
                    ? "font-semibold text-primary"
                    : "text-sidebar-foreground hover:text-foreground"
                )}
              >
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardNav({ onNavigate }: DashboardNavProps) {
  const pathname = usePathname();
  const { profile, isMaster } = useUserRole();
  const entries = filterNavEntriesForProfile(profile, isMaster);

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1 px-3 py-2">
      {entries.map((entry) => {
        if (entry.kind === "group") {
          return (
            <NavGroupSection
              key={entry.title}
              entry={entry}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          );
        }

        const isActive = isNavHrefActive(pathname, entry.href);
        const Icon = entry.icon;

        return (
          <Link
            key={entry.href}
            href={entry.href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-border bg-muted/50 text-foreground"
                : "border-transparent text-sidebar-foreground hover:border-border/70 hover:bg-muted/30"
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            <span className="truncate">{entry.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
