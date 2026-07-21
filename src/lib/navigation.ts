import {
  CalendarClock,
  Database,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  PieChart,
  Settings,
  SquarePlus,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { isAssessmentApplyPath } from "@/lib/assessment-apply-routes";
import type { UserProfile } from "@/lib/auth";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/rbac";

export type NavLink = {
  kind: "link";
  title: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
};

export type NavGroupItem = {
  title: string;
  href: string;
  permission: Permission;
  developed?: boolean;
};

export type NavGroup = {
  kind: "group";
  title: string;
  icon: LucideIcon;
  items: NavGroupItem[];
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
    icon: SquarePlus,
    items: [
      {
        title: "Empresa",
        href: "/dashboard/empresa",
        permission: PERMISSIONS.SETTINGS_MANAGE,
      },
      {
        title: "Profissionais",
        href: "/dashboard/profissionais",
        permission: PERMISSIONS.PROFESSIONALS_VIEW,
      },
      {
        title: "Equipe terapêutica",
        href: "/dashboard/profissionais?aba=equipe",
        permission: PERMISSIONS.PROFESSIONALS_VIEW,
      },
      {
        title: "Aprendizes",
        href: "/dashboard/pacientes",
        permission: PERMISSIONS.PATIENTS_VIEW,
      },
      {
        title: "Programas",
        href: "/dashboard/programas",
        permission: PERMISSIONS.ASSESSMENTS_VIEW,
      },
    ],
  },
  {
    kind: "group",
    title: "Evolução",
    icon: Stethoscope,
    items: [
      {
        title: "Evolução Diária (ABA)",
        href: "/dashboard/evolucao",
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
      },
      {
        title: "Evolução Convencional",
        href: "/dashboard/evolucao-convencional",
        permission: PERMISSIONS.CONVENTIONAL_EVOLUTION_VIEW,
      },
      {
        title: "Avaliações",
        href: "/dashboard/avaliacoes/aplicar",
        permission: PERMISSIONS.ASSESSMENTS_VIEW,
      },
    ],
  },
  {
    kind: "group",
    title: "Família/Escola",
    icon: GraduationCap,
    items: [
      {
        title: "Orientações/Dicas",
        href: "/dashboard/orientacoes-familia",
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
      },
      
      
    ],
  },
  {
    kind: "group",
    title: "Relatórios",
    icon: PieChart,
    items: [
      {
        title: "Desempenho Aprendiz",
        href: "/dashboard/relatorios",
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        title: "Treinamento IA — Relatórios",
        href: "/dashboard/relatorios/treinamento-ia",
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
      },
      
      
      
      
      
    ],
  },
  {
    kind: "group",
    title: "Agenda",
    icon: CalendarClock,
    items: [
      {
        title: "Agenda ABA",
        href: "/agenda",
        permission: PERMISSIONS.AGENDA_VIEW,
      },
      {
        title: "Agenda Convencional",
        href: "/agenda-convencional",
        permission: PERMISSIONS.AGENDA_VIEW,
      },
      {
        title: "Busca de Agenda",
        href: "/dashboard/busca-agenda",
        permission: PERMISSIONS.AGENDA_SEARCH,
      },
      
      
      {
        title: "Configurações",
        href: "/agenda/configuracoes",
        permission: PERMISSIONS.AGENDA_VIEW,
      },
      {
        title: "Monitor",
        href: "/painel-chamada",
        permission: PERMISSIONS.AGENDA_VIEW,
      },
      {
        title: "Biblioteca de Modelos",
        href: "/dashboard/modelos",
        permission: PERMISSIONS.DOCUMENT_TEMPLATES_VIEW,
      },
    ],
  },
  {
    kind: "group",
    title: "Auditoria",
    icon: Database,
    items: [
      {
        title: "Logs",
        href: "/dashboard/auditoria",
        permission: PERMISSIONS.AUDIT_LOGS_VIEW,
      },
      
    ],
  },
  {
    kind: "link",
    title: "Chat Interno",
    href: "/chat",
    icon: MessageSquare,
    permission: PERMISSIONS.INTERNAL_MESSAGING,
  },
  {
    kind: "link",
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_MANAGE,
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
      permission: item.permission,
    }));
  });
}

export function isNavHrefActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (href.startsWith("/em-desenvolvimento")) {
    return pathname === "/em-desenvolvimento";
  }

  const hrefPath = href.split("?")[0] ?? href;

  // Evolução → Avaliações: hub e instrumentos de aplicação
  if (hrefPath === "/dashboard/avaliacoes/aplicar") {
    return isAssessmentApplyPath(pathname);
  }

  // Cadastro → Profissionais / Equipe terapêutica compartilham a rota base
  if (hrefPath === "/dashboard/profissionais") {
    return (
      pathname === hrefPath || pathname.startsWith(`${hrefPath}/`)
    );
  }

  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}
