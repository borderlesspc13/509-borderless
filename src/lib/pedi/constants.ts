import type { PediArea } from "@/lib/pedi/types";

/** Contagens oficiais de itens Functional Skills (Capability) do PEDI. */
export const PEDI_AREA_MAX_RAW: Record<PediArea, number> = {
  self_care: 73,
  mobility: 59,
  social_function: 65,
};

export const PEDI_AREA_LABELS: Record<PediArea, string> = {
  self_care: "Autocuidado",
  mobility: "Mobilidade",
  social_function: "Função Social",
};

export const PEDI_AREA_PREFIX: Record<PediArea, string> = {
  self_care: "AC",
  mobility: "MB",
  social_function: "FS",
};

/**
 * Domínios Functional Skills por área (códigos curtos não-proprietários).
 * Contagens de itens alinhadas ao total oficial por área.
 */
export const PEDI_DOMAIN_DEFS: Record<
  PediArea,
  readonly { code: string; label: string; itemCount: number }[]
> = {
  self_care: [
    { code: "A", label: "Alimentação", itemCount: 14 },
    { code: "B", label: "Higiene pessoal", itemCount: 10 },
    { code: "C", label: "Banho", itemCount: 5 },
    { code: "D", label: "Vestuário — superior", itemCount: 8 },
    { code: "E", label: "Vestuário — inferior", itemCount: 8 },
    { code: "F", label: "Uso do toalete", itemCount: 5 },
    { code: "G", label: "Controle esfincteriano", itemCount: 5 },
    { code: "H", label: "Uso de utensílios", itemCount: 18 },
  ],
  mobility: [
    { code: "A", label: "Transferências — cadeira/cadeira de rodas", itemCount: 5 },
    { code: "B", label: "Transferências — banheiro", itemCount: 5 },
    { code: "C", label: "Transferências — banheira/chuveiro", itemCount: 4 },
    { code: "D", label: "Locomoção em ambientes internos", itemCount: 5 },
    { code: "E", label: "Locomoção em ambientes externos", itemCount: 5 },
    { code: "F", label: "Escadas", itemCount: 5 },
    { code: "G", label: "Métodos de locomoção", itemCount: 15 },
    { code: "H", label: "Dispositivos e distância", itemCount: 15 },
  ],
  social_function: [
    { code: "A", label: "Compreensão", itemCount: 5 },
    { code: "B", label: "Expressão", itemCount: 7 },
    { code: "C", label: "Comunicação", itemCount: 5 },
    { code: "D", label: "Resolução de problemas", itemCount: 5 },
    { code: "E", label: "Interação social", itemCount: 5 },
    { code: "F", label: "Participação em casa", itemCount: 5 },
    { code: "G", label: "Comunidade", itemCount: 5 },
    { code: "H", label: "Autoproteção e rotinas", itemCount: 13 },
    { code: "I", label: "Função doméstica / escola", itemCount: 15 },
  ],
};

export const PEDI_TEMPLATE_NAME = "PEDI";
export const PEDI_INSTRUMENT = "PEDI";
