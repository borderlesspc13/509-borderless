import { DEMUCA_TEMPLATE_NAME } from "@/lib/demuca";
import { EBAI_TEMPLATE_NAME } from "@/lib/ebai";
import { PEDI_TEMPLATE_NAME } from "@/lib/pedi";
import { SENSORY_PROFILE_TEMPLATE_NAME } from "@/lib/sensory-profile";

export const ASSESSMENT_APPLY_ROUTES: Record<string, string> = {
  [PEDI_TEMPLATE_NAME]: "/dashboard/avaliacoes/pedi",
  [SENSORY_PROFILE_TEMPLATE_NAME]: "/dashboard/avaliacoes/perfil-sensorial",
  [EBAI_TEMPLATE_NAME]: "/dashboard/avaliacoes/ebai",
  [DEMUCA_TEMPLATE_NAME]: "/dashboard/avaliacoes/demuca",
};

/** Instrumentos com tela de aplicação — usado na toolbar e nos cards. */
export const APPLICABLE_ASSESSMENTS = [
  {
    name: PEDI_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[PEDI_TEMPLATE_NAME],
    buttonLabel: "Aplicar PEDI",
  },
  {
    name: SENSORY_PROFILE_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[SENSORY_PROFILE_TEMPLATE_NAME],
    buttonLabel: "Perfil Sensorial II",
  },
  {
    name: EBAI_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[EBAI_TEMPLATE_NAME],
    buttonLabel: "EBAI",
  },
  {
    name: DEMUCA_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[DEMUCA_TEMPLATE_NAME],
    buttonLabel: "DEMUCA",
  },
] as const;

export function getAssessmentApplyRoute(templateName: string): string | null {
  return ASSESSMENT_APPLY_ROUTES[templateName] ?? null;
}

export function hasAssessmentApplyRoute(templateName: string): boolean {
  return templateName in ASSESSMENT_APPLY_ROUTES;
}
