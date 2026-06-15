export function formatPatientDate(value: string | null) {
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

export function formatPatientDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export const patientStatusLabels = {
  active: "Ativo",
  inactive: "Inativo",
  discharged: "Alta",
} as const;

export type PatientStatus = keyof typeof patientStatusLabels;

export function calculatePatientAge(birthDate: string | null) {
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

export function getPatientDisplaySubtitle(
  diagnosis: string | null,
  cpf: string | null
) {
  return diagnosis?.trim() || cpf?.trim() || null;
}

export function getPatientDisplayId(id: string) {
  const numeric = id.replace(/\D/g, "").slice(0, 6);

  return numeric.padStart(6, "0");
}

export function formatPatientDisplayValue(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : "—";
}

export function formatPatientBirthWithAge(birthDate: string | null) {
  if (!birthDate) {
    return "—";
  }

  const age = calculatePatientAge(birthDate);

  return age === "—"
    ? formatPatientDate(birthDate)
    : `${formatPatientDate(birthDate)} - ${age}`;
}

export function formatPatientFullName(
  fullName: string,
  diagnosis: string | null
) {
  const subtitle = diagnosis?.trim();

  return subtitle ? `${fullName} - ${subtitle}` : fullName;
}

export function getPatientToggleActionLabel(status: PatientStatus) {
  return status === "active" ? "Inativar" : "Ativar";
}

export function getNextPatientStatus(status: PatientStatus): PatientStatus {
  return status === "active" ? "inactive" : "active";
}

export function getPatientStatusToggleMessage(
  actionLabel: string,
  fullName: string,
  diagnosis: string | null
) {
  const displayName = formatPatientFullName(fullName, diagnosis);

  return `Tem certeza que deseja ${actionLabel} o aprendiz ${displayName}`;
}

export function formatPatientRegistrationStatus(
  status: PatientStatus,
  createdAt: string
) {
  const statusLabel = patientStatusLabels[status];
  const registeredAt = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));

  return `Aprendiz ${statusLabel}, cadastrado em ${registeredAt}`;
}

export const appointmentStatusLabels = {
  confirmado: "Confirmado",
  agendado: "Agendado",
  em_espera: "Em espera",
  cancelado: "Cancelado",
} as const;
