export const PROFESSIONAL_ROLES = [
  "Psicólogo",
  "Psicólogo(a)",
  "Assistente Terapêutico (AT)",
  "Coordenador",
  "Fonoaudiólogo",
  "Terapeuta Ocupacional",
  "Supervisor Administrativo",
  "Musicoterapeuta",
  "Neuropsicólogo",
] as const;

export type ProfessionalRole = (typeof PROFESSIONAL_ROLES)[number];
