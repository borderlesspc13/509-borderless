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

import type { UserProfile } from "@/lib/auth";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/rbac";
import { getUnderDevelopmentHref } from "@/lib/under-development";

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
        title: "Aprendizes",
        href: "/dashboard/pacientes",
        permission: PERMISSIONS.PATIENTS_VIEW,
      },
      {
        title: "Avaliações",
        href: "/dashboard/avaliacoes",
        permission: PERMISSIONS.ASSESSMENTS_VIEW,
      },
      {
        title: "Critérios Padrão",
        href: getUnderDevelopmentHref("Critérios Padrão"),
        permission: PERMISSIONS.ASSESSMENTS_VIEW,
        developed: false,
      },
      {
        title: "Programas",
        href: "/dashboard/programas",
        permission: PERMISSIONS.ASSESSMENTS_VIEW,
      },
      {
        title: "Pastas Curriculares",
        href: getUnderDevelopmentHref("Pastas Curriculares"),
        permission: PERMISSIONS.ASSESSMENTS_VIEW,
        developed: false,
      },
      {
        title: "Tipo Registro",
        href: getUnderDevelopmentHref("Tipo Registro"),
        permission: PERMISSIONS.PATIENTS_VIEW,
        developed: false,
      },
      {
        title: "Local Registro",
        href: getUnderDevelopmentHref("Local Registro"),
        permission: PERMISSIONS.PATIENTS_VIEW,
        developed: false,
      },
      {
        title: "Checklist",
        href: getUnderDevelopmentHref("Checklist"),
        permission: PERMISSIONS.PATIENTS_VIEW,
        developed: false,
      },
    ],
  },
  {
    kind: "group",
    title: "Atendimento",
    icon: Stethoscope,
    items: [
      {
        title: "Anamnese",
        href: getUnderDevelopmentHref("Anamnese"),
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
        developed: false,
      },
      {
        title: "Evolução Diária",
        href: "/dashboard/evolucao",
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
      },
      {
        title: "Sessão",
        href: getUnderDevelopmentHref("Sessão"),
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
        developed: false,
      },
      {
        title: "Plano Terapêutico",
        href: getUnderDevelopmentHref("Plano Terapêutico"),
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
        developed: false,
      },
      {
        title: "Avaliações",
        href: "/dashboard/avaliacoes",
        permission: PERMISSIONS.ASSESSMENTS_VIEW,
      },
      {
        title: "Supervisões",
        href: getUnderDevelopmentHref("Supervisões"),
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
        developed: false,
      },
      {
        title: "Painel De Manutenções",
        href: getUnderDevelopmentHref("Painel De Manutenções"),
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
        developed: false,
      },
      {
        title: "Checklist",
        href: getUnderDevelopmentHref("Checklist"),
        permission: PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
        developed: false,
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
        href: getUnderDevelopmentHref("Orientações/Dicas"),
        permission: PERMISSIONS.PATIENTS_VIEW,
        developed: false,
      },
      {
        title: "Registros De Rotina",
        href: getUnderDevelopmentHref("Registros De Rotina"),
        permission: PERMISSIONS.PATIENTS_VIEW,
        developed: false,
      },
      {
        title: "Narrativas ABC",
        href: getUnderDevelopmentHref("Narrativas ABC"),
        permission: PERMISSIONS.PATIENTS_VIEW,
        developed: false,
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
        title: "Evolução Critérios",
        href: getUnderDevelopmentHref("Evolução Critérios"),
        permission: PERMISSIONS.REPORTS_VIEW,
        developed: false,
      },
      {
        title: "Desempenho Aplicações",
        href: getUnderDevelopmentHref("Desempenho Aplicações"),
        permission: PERMISSIONS.REPORTS_VIEW,
        developed: false,
      },
      {
        title: "Desempenho Programas",
        href: getUnderDevelopmentHref("Desempenho Programas"),
        permission: PERMISSIONS.REPORTS_VIEW,
        developed: false,
      },
      {
        title: "Situação Estímulos",
        href: getUnderDevelopmentHref("Situação Estímulos"),
        permission: PERMISSIONS.REPORTS_VIEW,
        developed: false,
      },
      {
        title: "Gráfico 3D",
        href: getUnderDevelopmentHref("Gráfico 3D"),
        permission: PERMISSIONS.REPORTS_VIEW,
        developed: false,
      },
    ],
  },
  {
    kind: "group",
    title: "Agenda",
    icon: CalendarClock,
    items: [
      {
        title: "Realizar Agendamento",
        href: "/agenda",
        permission: PERMISSIONS.AGENDA_VIEW,
      },
      {
        title: "Busca de Agenda",
        href: "/dashboard/busca-agenda",
        permission: PERMISSIONS.AGENDA_SEARCH,
      },
      {
        title: "Local Agendamento",
        href: getUnderDevelopmentHref("Local Agendamento"),
        permission: PERMISSIONS.AGENDA_VIEW,
        developed: false,
      },
      {
        title: "Hist. De Agendamento",
        href: getUnderDevelopmentHref("Hist. De Agendamento"),
        permission: PERMISSIONS.AGENDA_VIEW,
        developed: false,
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
      {
        title: "Acessos",
        href: getUnderDevelopmentHref("Acessos"),
        permission: PERMISSIONS.AUDIT_LOGS_VIEW,
        developed: false,
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

  return pathname === href || pathname.startsWith(`${href}/`);
}
