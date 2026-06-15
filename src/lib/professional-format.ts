export function formatProfessionalDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export const professionalStatusLabels = {
  active: "Ativo",
  inactive: "Inativo",
} as const;

export type ProfessionalStatus = keyof typeof professionalStatusLabels;

export function calculateProfessionalAge(birthDate: string | null) {
  if (!birthDate) {
    return "—";
  }

  const [year, month, day] = birthDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return "—";
  }

  if (years === 0) {
    return months === 1 ? "1 mês" : `${months} meses`;
  }

  const yearLabel = years === 1 ? "1 ano" : `${years} anos`;

  if (months === 0) {
    return yearLabel;
  }

  const monthLabel = months === 1 ? "1 mês" : `${months} meses`;

  return `${yearLabel}, ${monthLabel}`;
}

export function getProfessionalDisplaySubtitle(
  cpf: string | null,
  professionalCouncil: string | null
) {
  return cpf?.trim() || professionalCouncil?.trim() || null;
}

export function getProfessionalDisplayId(id: string) {
  const numeric = id.replace(/\D/g, "").slice(0, 6);

  return numeric.padStart(6, "0");
}

export function formatProfessionalDisplayValue(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : "—";
}

export function getProfessionalToggleActionLabel(status: ProfessionalStatus) {
  return status === "active" ? "Inativar" : "Ativar";
}

export function getProfessionalStatusToggleMessage(
  actionLabel: string,
  fullName: string,
  subtitle: string | null
) {
  const displayName = subtitle ? `${fullName} - ${subtitle}` : fullName;

  return `Tem certeza que deseja ${actionLabel} o profissional ${displayName}`;
}

export function formatProfessionalRegistrationStatus(
  status: ProfessionalStatus,
  createdAt: string
) {
  const statusLabel = professionalStatusLabels[status];
  const registeredAt = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));

  return `Profissional ${statusLabel}, cadastrado em ${registeredAt}`;
}

export function isProfessionalSupervisor(profile: string) {
  return profile === "SUPERVISOR" || profile === "ADMIN";
}

export function getProfessionalRoleLabel(
  professionalRole: string | null,
  profileLabel: string
) {
  return professionalRole?.trim() || profileLabel;
}
