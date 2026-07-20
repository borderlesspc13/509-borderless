import { DEMUCA_TEMPLATE_NAME } from "@/lib/demuca";
import { EBAI_TEMPLATE_NAME } from "@/lib/ebai";
import { PEDI_TEMPLATE_NAME } from "@/lib/pedi";
import { SENSORY_PROFILE_TEMPLATE_NAME } from "@/lib/sensory-profile";

/** Hub de aplicação ao paciente (menu Evolução → Avaliações). */
export const ASSESSMENT_APPLY_HUB_HREF = "/dashboard/avaliacoes/aplicar";

export const ASSESSMENT_APPLY_ROUTES: Record<string, string> = {
  [PEDI_TEMPLATE_NAME]: "/dashboard/avaliacoes/pedi",
  [SENSORY_PROFILE_TEMPLATE_NAME]: "/dashboard/avaliacoes/perfil-sensorial",
  [EBAI_TEMPLATE_NAME]: "/dashboard/avaliacoes/ebai",
  [DEMUCA_TEMPLATE_NAME]: "/dashboard/avaliacoes/demuca",
};

/** Instrumentos com tela de aplicação — usado no hub de atendimento. */
export const APPLICABLE_ASSESSMENTS = [
  {
    name: PEDI_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[PEDI_TEMPLATE_NAME],
    buttonLabel: "PEDI",
    description:
      "Pediatric Evaluation of Disability Inventory — funcionalidade e assistência do cuidador.",
  },
  {
    name: SENSORY_PROFILE_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[SENSORY_PROFILE_TEMPLATE_NAME],
    buttonLabel: "Perfil Sensorial II",
    description:
      "Avaliação do processamento sensorial em contextos cotidianos.",
  },
  {
    name: EBAI_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[EBAI_TEMPLATE_NAME],
    buttonLabel: "EBAI",
    description:
      "Escala Brasileira de Avaliação do Desenvolvimento Infantil.",
  },
  {
    name: DEMUCA_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[DEMUCA_TEMPLATE_NAME],
    buttonLabel: "DEMUCA",
    description:
      "Desenvolvimento Motor e Habilidades Funcionais da Criança.",
  },
] as const;

const ASSESSMENT_APPLY_PATHS = new Set([
  ASSESSMENT_APPLY_HUB_HREF,
  ...Object.values(ASSESSMENT_APPLY_ROUTES),
]);

export function getAssessmentApplyRoute(templateName: string): string | null {
  return ASSESSMENT_APPLY_ROUTES[templateName] ?? null;
}

export function hasAssessmentApplyRoute(templateName: string): boolean {
  return templateName in ASSESSMENT_APPLY_ROUTES;
}

/** Rotas de aplicação ao paciente (não confundir com cadastro de templates). */
export function isAssessmentApplyPath(pathname: string): boolean {
  return (
    ASSESSMENT_APPLY_PATHS.has(pathname) ||
    pathname.startsWith(`${ASSESSMENT_APPLY_HUB_HREF}/`)
  );
}
