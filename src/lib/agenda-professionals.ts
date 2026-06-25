import type { ProfessionalRole } from "@/lib/professionals-data";

export type AgendaProfessional = {
  id: string;
  name: string;
  role: ProfessionalRole | null;
};

export function mapAgendaProfessionalOption(input: {
  id: string;
  fullName: string;
  professionalRole: ProfessionalRole | null;
}): AgendaProfessional {
  return {
    id: input.id,
    name: input.fullName,
    role: input.professionalRole,
  };
}

export function getAgendaProfessionalRole(
  professionals: AgendaProfessional[],
  professionalName: string,
  professionalUserId?: string | null
): ProfessionalRole | null {
  const match = professionals.find(
    (professional) =>
      (professionalUserId && professional.id === professionalUserId) ||
      professional.name.localeCompare(professionalName, "pt-BR", {
        sensitivity: "accent",
      }) === 0
  );

  return match?.role ?? null;
}

export function filterAgendaProfessionalsByRole(
  professionals: AgendaProfessional[],
  role: ProfessionalRole | "all"
) {
  if (role === "all") {
    return professionals;
  }

  return professionals.filter((professional) => professional.role === role);
}
