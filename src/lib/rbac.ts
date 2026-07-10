import type { UserProfile } from "@/lib/auth";

export const ROLES = {
  ADMIN: "ADMIN",
  SUPERVISOR: "SUPERVISOR",
  RECEPCAO: "RECEPCAO",
  AT1: "AT1",
  AT2: "AT2",
  FAMILIA: "FAMILIA",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  AGENDA_VIEW: "agenda:view",
  AGENDA_MANAGE: "agenda:manage",
  AGENDA_SEARCH: "agenda:search",
  AGENDA_FORCE: "agenda:force",
  PATIENTS_VIEW: "patients:view",
  PROFESSIONALS_VIEW: "professionals:view",
  ASSESSMENTS_VIEW: "assessments:view",
  CLINICAL_EVOLUTION_VIEW: "clinical_evolution:view",
  CLINICAL_EVOLUTION_MANAGE: "clinical_evolution:manage",
  CONVENTIONAL_EVOLUTION_VIEW: "conventional_evolution:view",
  CONVENTIONAL_EVOLUTION_MANAGE: "conventional_evolution:manage",
  DOCUMENT_TEMPLATES_VIEW: "document_templates:view",
  DOCUMENT_TEMPLATES_MANAGE: "document_templates:manage",
  REPORTS_VIEW: "reports:view",
  AUDIT_LOGS_VIEW: "audit_logs:view",
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
  INTERNAL_MESSAGING: "internal_messaging:use",
  FINANCE_MANAGE: "finance:manage",
  TEAM_MANAGE: "team:manage",
  FAMILY_PORTAL_VIEW: "family_portal:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const LEGACY_ROLE_MAP: Record<string, Role> = {
  administracao: ROLES.ADMIN,
  supervisor: ROLES.SUPERVISOR,
  recepcao: ROLES.RECEPCAO,
  at: ROLES.AT1,
};

const BASE_THERAPIST_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.AGENDA_VIEW,
  PERMISSIONS.PATIENTS_VIEW,
  PERMISSIONS.ASSESSMENTS_VIEW,
  PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
  PERMISSIONS.DOCUMENT_TEMPLATES_VIEW,
  PERMISSIONS.INTERNAL_MESSAGING,
] as const satisfies readonly Permission[];

const CLINICAL_EVOLUTION_EDITOR_PERMISSIONS = [
  PERMISSIONS.CLINICAL_EVOLUTION_MANAGE,
  PERMISSIONS.DOCUMENT_TEMPLATES_MANAGE,
  PERMISSIONS.FINANCE_MANAGE,
] as const satisfies readonly Permission[];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.RECEPCAO]: [
    PERMISSIONS.AGENDA_VIEW,
    PERMISSIONS.AGENDA_MANAGE,
    PERMISSIONS.INTERNAL_MESSAGING,
  ],
  [ROLES.FAMILIA]: [PERMISSIONS.FAMILY_PORTAL_VIEW],
  [ROLES.AT2]: [...BASE_THERAPIST_PERMISSIONS],
  [ROLES.AT1]: [
    ...BASE_THERAPIST_PERMISSIONS,
    PERMISSIONS.CLINICAL_EVOLUTION_MANAGE,
    PERMISSIONS.CONVENTIONAL_EVOLUTION_VIEW,
    PERMISSIONS.CONVENTIONAL_EVOLUTION_MANAGE,
  ],
  [ROLES.SUPERVISOR]: [
    ...BASE_THERAPIST_PERMISSIONS,
    ...CLINICAL_EVOLUTION_EDITOR_PERMISSIONS,
    PERMISSIONS.AGENDA_MANAGE,
    PERMISSIONS.AGENDA_SEARCH,
    PERMISSIONS.PROFESSIONALS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.CONVENTIONAL_EVOLUTION_VIEW,
    PERMISSIONS.CONVENTIONAL_EVOLUTION_MANAGE,
  ],
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
};

export const CLINICAL_ROLES = [ROLES.AT1, ROLES.AT2, ROLES.SUPERVISOR] as const;

export const PROFESSIONAL_ROLES = [
  ROLES.AT1,
  ROLES.AT2,
  ROLES.SUPERVISOR,
  ROLES.ADMIN,
] as const;

export const RECEPCAO_HOME_PATH = "/agenda";

export const FAMILIA_HOME_PATH = "/portal-familia";

export const RECEPCAO_ALLOWED_PATHS = [RECEPCAO_HOME_PATH, "/chat"] as const;

export const FAMILIA_ALLOWED_PATHS = [FAMILIA_HOME_PATH] as const;

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/agenda": PERMISSIONS.AGENDA_VIEW,
  "/agenda/configuracoes": PERMISSIONS.AGENDA_VIEW,
  "/painel-chamada": PERMISSIONS.AGENDA_VIEW,
  "/dashboard": PERMISSIONS.DASHBOARD_VIEW,
  "/dashboard/busca-agenda": PERMISSIONS.AGENDA_SEARCH,
  "/prontuario": PERMISSIONS.PATIENTS_VIEW,
  "/paciente": PERMISSIONS.PATIENTS_VIEW,
  "/dashboard/pacientes": PERMISSIONS.PATIENTS_VIEW,
  "/dashboard/profissionais": PERMISSIONS.PROFESSIONALS_VIEW,
  "/dashboard/avaliacoes": PERMISSIONS.ASSESSMENTS_VIEW,
  "/dashboard/programas": PERMISSIONS.ASSESSMENTS_VIEW,
  "/evolucao": PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
  "/dashboard/evolucao": PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
  "/dashboard/orientacoes-familia": PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
  "/agenda-convencional": PERMISSIONS.AGENDA_VIEW,
  "/dashboard/evolucao-convencional": PERMISSIONS.CONVENTIONAL_EVOLUTION_VIEW,
  "/dashboard/modelos": PERMISSIONS.DOCUMENT_TEMPLATES_VIEW,
  "/dashboard/relatorios": PERMISSIONS.REPORTS_VIEW,
  "/dashboard/relatorios/treinamento-ia": PERMISSIONS.CLINICAL_EVOLUTION_VIEW,
  "/dashboard/auditoria": PERMISSIONS.AUDIT_LOGS_VIEW,
  "/chat": PERMISSIONS.INTERNAL_MESSAGING,
  "/dashboard/empresa": PERMISSIONS.SETTINGS_MANAGE,
  "/configuracoes": PERMISSIONS.SETTINGS_MANAGE,
  "/dashboard/configuracoes": PERMISSIONS.SETTINGS_MANAGE,
  "/em-desenvolvimento": PERMISSIONS.DASHBOARD_VIEW,
  "/portal-familia": PERMISSIONS.FAMILY_PORTAL_VIEW,
};

export const CLINICAL_EVOLUTION_EDITOR_ROLES = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.AT1,
] as const satisfies readonly Role[];

export const REPORTS_SUPERVISOR_ROLES = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
] as const satisfies readonly Role[];

export function canAccessClinicalReports(
  profile: UserProfile | string,
  isMaster = false
) {
  if (isMaster) {
    return true;
  }

  const role = normalizeRole(profile);
  return (REPORTS_SUPERVISOR_ROLES as readonly Role[]).includes(role);
}

export function canManageClinicSettings(
  profile: UserProfile | string,
  isMaster = false
) {
  if (isMaster) {
    return true;
  }

  return normalizeRole(profile) === ROLES.ADMIN;
}

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function isRole(value: string): value is Role {
  return Object.values(ROLES).includes(value as Role);
}

export function normalizeRole(profile: UserProfile | string): Role {
  if (isRole(profile)) {
    return profile;
  }

  return LEGACY_ROLE_MAP[profile] ?? ROLES.RECEPCAO;
}

export function hasPermission(
  profile: UserProfile | string,
  permission: Permission,
  isMaster = false
) {
  if (isMaster) {
    return true;
  }

  const role = normalizeRole(profile);
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getPermissionsForRole(
  profile: UserProfile | string,
  isMaster = false
): readonly Permission[] {
  if (isMaster) {
    return Object.values(PERMISSIONS);
  }

  return ROLE_PERMISSIONS[normalizeRole(profile)];
}

export function isReceptionAllowedPath(pathname: string) {
  const normalizedPath = normalizePathname(pathname);

  return (RECEPCAO_ALLOWED_PATHS as readonly string[]).includes(normalizedPath);
}

export function isFamilyAllowedPath(pathname: string) {
  const normalizedPath = normalizePathname(pathname);

  return (FAMILIA_ALLOWED_PATHS as readonly string[]).includes(normalizedPath);
}

export function getAccessDeniedRedirectPath(profile: UserProfile | string) {
  if (isFamilyOnlyRole(profile)) {
    return `${FAMILIA_HOME_PATH}?acesso=negado`;
  }

  return isReceptionOnlyRole(profile)
    ? `${RECEPCAO_HOME_PATH}?acesso=negado`
    : "/dashboard?acesso=negado";
}

export function getRoutePermission(pathname: string): Permission | null {
  const normalizedPath = normalizePathname(pathname);

  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .sort((left, right) => right.length - left.length)
    .find(
      (route) =>
        normalizedPath === route || normalizedPath.startsWith(`${route}/`)
    );

  return matchedRoute ? ROUTE_PERMISSIONS[matchedRoute] : null;
}

export function canAccessRoute(
  pathname: string,
  profile: UserProfile | string,
  isMaster = false
) {
  if (isMaster) {
    return true;
  }

  const role = normalizeRole(profile);

  if (role === ROLES.FAMILIA && !isFamilyAllowedPath(pathname)) {
    return false;
  }

  if (role !== ROLES.FAMILIA && isFamilyAllowedPath(pathname)) {
    return false;
  }

  if (role === ROLES.RECEPCAO && !isReceptionAllowedPath(pathname)) {
    return false;
  }

  const permission = getRoutePermission(pathname);

  if (!permission) {
    return role !== ROLES.RECEPCAO || isReceptionAllowedPath(pathname);
  }

  return hasPermission(profile, permission, isMaster);
}

export function canEditClinicalEvolutionRecords(
  profile: UserProfile | string,
  isMaster = false
) {
  if (isMaster) {
    return true;
  }

  const role = normalizeRole(profile);
  return (CLINICAL_EVOLUTION_EDITOR_ROLES as readonly Role[]).includes(role);
}

export function isReceptionOnlyRole(profile: UserProfile | string) {
  return normalizeRole(profile) === ROLES.RECEPCAO;
}

export function isFamilyOnlyRole(profile: UserProfile | string) {
  return normalizeRole(profile) === ROLES.FAMILIA;
}

export function isClinicalRole(profile: UserProfile | string) {
  const role = normalizeRole(profile);
  return (CLINICAL_ROLES as readonly Role[]).includes(role);
}
