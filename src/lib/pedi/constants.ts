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
 * Domínios Functional Skills por área (estrutura da versão brasileira adaptada).
 * Contagens alinhadas ao total oficial por área (73 / 59 / 65).
 */
export const PEDI_DOMAIN_DEFS: Record<
  PediArea,
  readonly { code: string; label: string; itemCount: number }[]
> = {
  self_care: [
    { code: "A", label: "Textura dos alimentos", itemCount: 4 },
    { code: "B", label: "Utilização de utensílios", itemCount: 5 },
    { code: "C", label: "Utilização de recipientes de beber", itemCount: 5 },
    { code: "D", label: "Higiene oral", itemCount: 5 },
    { code: "E", label: "Cuidados com os cabelos", itemCount: 4 },
    { code: "F", label: "Cuidados com o nariz", itemCount: 5 },
    { code: "G", label: "Lavar as mãos", itemCount: 5 },
    { code: "H", label: "Lavar o corpo e a face", itemCount: 5 },
    { code: "I", label: "Vestir — parte superior", itemCount: 5 },
    { code: "J", label: "Fechos", itemCount: 5 },
    { code: "K", label: "Vestir — parte inferior", itemCount: 5 },
    { code: "L", label: "Calçados e meias", itemCount: 5 },
    { code: "M", label: "Tarefas de toilette", itemCount: 5 },
    { code: "N", label: "Manejo da bexiga", itemCount: 5 },
    { code: "O", label: "Manejo intestinal", itemCount: 5 },
  ],
  mobility: [
    { code: "A", label: "Transferências — toilette", itemCount: 5 },
    { code: "B", label: "Transferências — cadeira/cadeira de rodas", itemCount: 5 },
    { code: "C", label: "Transferências — carro", itemCount: 5 },
    { code: "D", label: "Transferências — cama", itemCount: 4 },
    { code: "E", label: "Transferências — banheira/chuveiro", itemCount: 5 },
    { code: "F", label: "Locomoção interna — método", itemCount: 5 },
    { code: "G", label: "Locomoção interna — distância/velocidade", itemCount: 5 },
    { code: "H", label: "Locomoção externa — método", itemCount: 5 },
    { code: "I", label: "Locomoção externa — distância/velocidade", itemCount: 5 },
    { code: "J", label: "Subir escadas", itemCount: 5 },
    { code: "K", label: "Descer escadas", itemCount: 5 },
    { code: "L", label: "Locomoção — resistência e terreno", itemCount: 5 },
  ],
  social_function: [
    { code: "A", label: "Compreensão", itemCount: 5 },
    { code: "B", label: "Expressão", itemCount: 5 },
    { code: "C", label: "Comunicação", itemCount: 5 },
    { code: "D", label: "Resolução de problemas", itemCount: 5 },
    { code: "E", label: "Interação social", itemCount: 5 },
    { code: "F", label: "Brincar interativo", itemCount: 5 },
    { code: "G", label: "Brincar com objetos", itemCount: 5 },
    { code: "H", label: "Participação com pares", itemCount: 5 },
    { code: "I", label: "Auto-informação", itemCount: 5 },
    { code: "J", label: "Orientação no tempo", itemCount: 5 },
    { code: "K", label: "Tarefas domésticas", itemCount: 5 },
    { code: "L", label: "Autoproteção", itemCount: 5 },
    { code: "M", label: "Função na comunidade", itemCount: 5 },
  ],
};

/** Normativo aplica-se até 7 anos (84 meses). Acima disso, apenas escore contínuo. */
export const PEDI_NORMATIVE_MAX_AGE_MONTHS = 84;

export const PEDI_TEMPLATE_NAME = "PEDI";
export const PEDI_INSTRUMENT = "PEDI";
