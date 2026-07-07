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
  "Psicopedagoga",
] as const;

export type ProfessionalRole = (typeof PROFESSIONAL_ROLES)[number];
