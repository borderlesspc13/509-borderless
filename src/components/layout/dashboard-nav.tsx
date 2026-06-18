"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

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

function NavGroupSection({
  entry,
  pathname,
  onNavigate,
}: {
  entry: Extract<NavEntry, { kind: "group" }>;
  pathname: string;
  onNavigate?: () => void;
}) {
  const hasActiveChild = entry.items.some((item) =>
    isNavHrefActive(pathname, item.href)
  );
  const [isOpen, setIsOpen] = useState(hasActiveChild);
  const Icon = entry.icon;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          hasActiveChild
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
        aria-expanded={isOpen}
      >
        <Icon className="size-5 shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">{entry.title}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div className="ml-3 space-y-0.5 border-l border-sidebar-border pl-3">
          {entry.items.map((item) => {
            const isActive = isNavHrefActive(pathname, item.href);
            const ItemIcon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex min-h-9 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all",
                  isActive
                    ? "bg-primary font-medium text-primary-foreground shadow-[0_2px_8px_color-mix(in_oklch,var(--primary)_22%,transparent)]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <ItemIcon className="size-4 shrink-0" aria-hidden />
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
    <nav aria-label="Navegação principal" className="flex flex-col gap-1.5 px-3 py-1">
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
              "flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-[0_4px_12px_color-mix(in_oklch,var(--primary)_25%,transparent)]"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
