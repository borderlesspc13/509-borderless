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

export type Professional = {
  name: string;
  role: ProfessionalRole;
};

export const professionals: Professional[] = [
  { name: "Ana Silva", role: "Psicólogo" },
  { name: "Carlos Lima", role: "Assistente Terapêutico (AT)" },
  { name: "Juliana Costa", role: "Fonoaudiólogo" },
  { name: "Roberto Mendes", role: "Coordenador" },
  { name: "Patrícia Souza", role: "Terapeuta Ocupacional" },
];

const professionalsByName = new Map(
  professionals.map((professional) => [professional.name, professional])
);

export function getProfessionalRole(
  professionalName: string
): ProfessionalRole | null {
  return professionalsByName.get(professionalName)?.role ?? null;
}

export function getProfessionalsByRole(role: ProfessionalRole | "all") {
  if (role === "all") {
    return professionals;
  }

  return professionals.filter((professional) => professional.role === role);
}
