import type {
  SensoryAgeBand,
  SensoryClassification,
  SensoryQuadrant,
  SensorySection,
} from "@/lib/sensory-profile/types";

export const SENSORY_PROFILE_TEMPLATE_NAME = "Perfil Sensorial II";
export const SENSORY_PROFILE_INSTRUMENT = "Perfil Sensorial II";

export const SENSORY_SECTION_LABELS: Record<SensorySection, string> = {
  auditory: "Auditivo",
  visual: "Visual",
  touch: "Tato",
  movement: "Movimentos",
};

export const SENSORY_SECTION_PREFIX: Record<SensorySection, string> = {
  auditory: "AUD",
  visual: "VIS",
  touch: "TAT",
  movement: "MOV",
};

export const SENSORY_QUADRANT_LABELS: Record<SensoryQuadrant, string> = {
  seeking: "Busca",
  avoiding: "Esquiva",
  sensitivity: "Sensibilidade",
  registration: "Registro",
};

export const SENSORY_QUADRANT_PREFIX: Record<SensoryQuadrant, string> = {
  seeking: "SE",
  avoiding: "AV",
  sensitivity: "SI",
  registration: "RE",
};

export const SENSORY_AGE_BAND_LABELS: Record<SensoryAgeBand, string> = {
  infant_0_6m: "0–6 meses",
  toddler_7_35m: "7–35 meses",
  child_3_14y: "3–14 anos",
  school: "Escolar",
};

export const SENSORY_CLASSIFICATION_LABELS: Record<SensoryClassification, string> = {
  typical: "Diferença Típica",
  probable_difference: "Diferença Provável",
  definite_difference: "Diferença Clara",
};

export const SENSORY_LIKERT_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Quase nunca",
  2: "Raramente",
  3: "Ocasionalmente",
  4: "Frequentemente",
  5: "Quase sempre",
};

/** Itens ilustrativos por quadrante em cada seção (substituir por itens oficiais). */
export const SENSORY_ITEM_TEMPLATES: Record<
  SensoryQuadrant,
  readonly [string, string][]
> = {
  seeking: [
    ["Busca estímulos intensos neste canal", "Procura experiências sensoriais fortes"],
    ["Gosta de ambientes com alta estimulação", "Prefere atividades com forte input sensorial"],
  ],
  avoiding: [
    ["Evita estímulos neste canal", "Demonstra desconforto com input sensorial"],
    ["Recusa atividades com este tipo de estímulo", "Protege-se de experiências sensoriais"],
  ],
  sensitivity: [
    ["Reage com irritação a estímulos leves", "Percebe estímulos que outros não notam"],
    ["Demonstra incômodo rápido com input sensorial", "Responde de forma intensa a estímulos sutis"],
  ],
  registration: [
    ["Não percebe estímulos neste canal", "Precisa de estímulos repetidos para responder"],
    ["Parece não notar input sensorial relevante", "Demora para registrar estímulos sensoriais"],
  ],
};
