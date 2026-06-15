import {
  CalendarDays,
  CalendarSearch,
  ClipboardCheck,
  FileBarChart,
  FileText,
  LayoutDashboard,
  ScrollText,
  Settings,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { UserProfile } from "@/lib/auth";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/rbac";

export type NavLink = {
  kind: "link";
  title: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
};

export type NavGroup = {
  kind: "group";
  title: string;
  icon: LucideIcon;
  items: Omit<NavLink, "kind">[];
};

export type NavEntry = NavLink | NavGroup;

export const mainNavEntries: NavEntry[] = [
  {
    kind: "link",
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    kind: "group",
    title: "Cadastro",
    icon: Users,
    items: [
      {
        title: "Aprendizes",
        href: "/prontuario",
        icon: Users,
        permission: PERMISSIONS.PATIENTS_VIEW,
      },
      {
        title: "Profissionais",
        href: "/dashboard/profissionais",
        icon: UserCog,
        permission: PERMISSIONS.PROFESSIONALS_VIEW,
      },
      {
        title: "Avaliações",
        href: "/dashboard/avaliacoes",
        icon: ClipboardCheck,
        permission: PERMISSIONS.ASSESSMENTS_VIEW,
      },
    ],
  },
  {
    kind: "group",
    title: "Atendimento",
    icon: ClipboardCheck,
    items: [
      {
        title: "Evolução Clínica",
        href: "/evolucao",
        icon: FileText,
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
      },
    ],
  },
  {
    kind: "group",
    title: "Relatórios",
    icon: FileBarChart,
    items: [
      {
        title: "Indicadores Clínicos",
        href: "/dashboard/relatorios",
        icon: FileBarChart,
        permission: PERMISSIONS.REPORTS_VIEW,
      },
    ],
  },
  {
    kind: "group",
    title: "Agenda",
    icon: CalendarDays,
    items: [
      {
        title: "Agenda Diária",
        href: "/agenda",
        icon: CalendarDays,
        permission: PERMISSIONS.AGENDA_VIEW,
      },
      {
        title: "Busca de Agenda",
        href: "/dashboard/busca-agenda",
        icon: CalendarSearch,
        permission: PERMISSIONS.AGENDA_SEARCH,
      },
    ],
  },
  {
    kind: "link",
    title: "Auditoria",
    href: "/dashboard/auditoria",
    icon: ScrollText,
    permission: PERMISSIONS.AUDIT_LOGS_VIEW,
  },
  {
    kind: "link",
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
];

export function filterNavEntriesForProfile(
  profile: UserProfile,
  isMaster = false
): NavEntry[] {
  return mainNavEntries
    .map((entry) => {
      if (entry.kind === "link") {
        return hasPermission(profile, entry.permission, isMaster) ? entry : null;
      }

      const visibleItems = entry.items.filter((item) =>
        hasPermission(profile, item.permission, isMaster)
      );

      if (visibleItems.length === 0) {
        return null;
      }

      return { ...entry, items: visibleItems };
    })
    .filter((entry): entry is NavEntry => entry !== null);
}

/** @deprecated Use filterNavEntriesForProfile */
export function getNavItemsForProfile(
  profile: UserProfile,
  isMaster = false
) {
  return filterNavEntriesForProfile(profile, isMaster).flatMap((entry) => {
    if (entry.kind === "link") {
      return [
        {
          title: entry.title,
          href: entry.href,
          icon: entry.icon,
          permission: entry.permission,
        },
      ];
    }

    return entry.items.map((item) => ({
      title: item.title,
      href: item.href,
      icon: item.icon,
      permission: item.permission,
    }));
  });
}

export function isNavHrefActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
