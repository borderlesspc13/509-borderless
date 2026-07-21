import type { PediArea } from "@/lib/pedi/types";

/**
 * Enunciados Functional Skills (Capability) — versão brasileira adaptada.
 * Textos alinhados à folha de resposta / Avalia TO enviada pelo cliente.
 * Calibração de dificuldade (mapa Rasch) entra na Fase 3 com o Excel oficial.
 */
export const PEDI_ITEM_TEXTS: Record<PediArea, readonly string[]> = {
  self_care: [
    // A — Textura dos alimentos (1–4)
    "Come alimento batido/amassado/coado",
    "Come alimento moído/granulado",
    "Come alimento picado/em pedaços",
    "Come comidas de texturas variadas",
    // B — Utilização de utensílios (5–9)
    "Alimenta-se com os dedos",
    "Pega comida com colher e leva até a boca",
    "Usa bem a colher (derramando o mínimo)",
    "Usa bem o garfo (derramando o mínimo)",
    "Usa faca para passar manteiga no pão; corta alimentos macios",
    // C — Recipientes de beber (10–14)
    "Segura a mamadeira ou copo com bico ou canudo",
    "Levanta copo para beber, mas pode derramar",
    "Levanta, com firmeza, copo sem tampa, usando as 2 mãos",
    "Levanta, com firmeza, copo sem tampa, usando 1 das mãos",
    "Serve-se de líquidos de uma jarra ou embalagem",
    // D — Higiene oral (15–19)
    "Abre a boca para a limpeza dos dentes",
    "Segura escova de dentes",
    "Escova os dentes, porém sem escovação completa",
    "Escova os dentes completamente",
    "Coloca creme dental na escova",
    // E — Cuidados com os cabelos (20–23)
    "Mantém a cabeça estável enquanto o cabelo é penteado",
    "Leva pente ou escova até o cabelo",
    "Escova ou penteia o cabelo",
    "É capaz de desembaraçar e partir o cabelo",
    // F — Cuidados com o nariz (24–28)
    "Permite que o nariz seja limpo",
    "Assoa o nariz com o lenço",
    "Limpa o nariz usando lenço ou papel quando solicitado",
    "Limpa o nariz usando lenço ou papel sem ser solicitado",
    "Limpa e assoa o nariz sem ser solicitado",
    // G — Lavar as mãos (29–33)
    "Mantém as mãos elevadas para que as mesmas sejam lavadas",
    "Esfrega as mãos uma na outra para limpá-las",
    "Abre e fecha torneira e utiliza sabão",
    "Seca as mãos completamente",
    "Lava as mãos completamente",
    // H — Lavar o corpo e a face (34–38)
    "Tenta lavar partes do corpo",
    "Lava o corpo completamente, não incluindo a face",
    "Lava a face",
    "Obtém sabão e o utiliza adequadamente",
    "Seca o corpo completamente",
    // I — Vestir — parte superior (39–43)
    "Ajuda a vestir camiseta/blusa estendendo os braços",
    "Remove camiseta, vestido ou blusa sem mangas",
    "Coloca camiseta, vestido ou blusa sem mangas",
    "Remove camisa ou blusa com abertura frontal",
    "Coloca camisa ou blusa com abertura frontal (sem abotoar)",
    // J — Fechos (44–48)
    "Tenta ajudar com fechos (botões, zíper, velcro)",
    "Abotoa e desabotoa botões grandes",
    "Abotoa e desabotoa botões de camisa/blusa",
    "Abre e fecha zíperes separáveis",
    "Abre e fecha colchetes, fivelas ou velcro",
    // K — Vestir — parte inferior (49–53)
    "Ajuda a vestir calças estendendo as pernas",
    "Remove calças elásticas, shorts ou saia",
    "Coloca calças elásticas, shorts ou saia",
    "Remove calças com fechos (incluindo abrir os fechos)",
    "Coloca calças com fechos (incluindo fechar os fechos)",
    // L — Calçados e meias (54–58)
    "Remove meias",
    "Coloca meias",
    "Remove sapatos sem cadarço/velcro",
    "Coloca sapatos sem cadarço/velcro",
    "Amarra cadarços",
    // M — Tarefas de toilette (59–63)
    "Senta no toilette ou penico",
    "Obtém papel higiênico",
    "Limpa-se após urinar ou evacuar",
    "Limpa-se completamente após evacuar",
    "Puxa a descarga e arruma as roupas após usar o toilette",
    // N — Manejo da bexiga (64–68)
    "Indica necessidade de urinar (gesto ou verbalmente)",
    "Usa o toilette ou penico regularmente para urinar",
    "Continente durante o dia, com eventuais acidentes",
    "Continente durante o dia de forma consistente",
    "Continente durante a noite",
    // O — Manejo intestinal (69–73)
    "Indica necessidade de evacuar (gesto ou verbalmente)",
    "Usa o toilette ou penico regularmente para evacuar",
    "Continente intestinal durante o dia, com eventuais acidentes",
    "Continente intestinal durante o dia de forma consistente",
    "Continente intestinal durante o dia e a noite",
  ],

  mobility: [
    // A — Toilette (1–5)
    "Senta-se no toilette ou penico",
    "Senta-se e levanta-se do toilette ou penico com apoio",
    "Senta-se e levanta-se do toilette ou penico sem apoio",
    "Sobe e desce do toilette adaptado ou com degrau",
    "Realiza transferência completa no toilette de forma segura",
    // B — Cadeira (6–10)
    "Senta-se em cadeira comum ou de rodas com apoio",
    "Senta-se em cadeira comum ou de rodas sem apoio",
    "Levanta-se de cadeira comum ou de rodas com apoio",
    "Levanta-se de cadeira comum ou de rodas sem apoio",
    "Realiza transferência cadeira ↔ superfície de forma segura",
    // C — Carro (11–15)
    "Entra no carro com assistência máxima",
    "Entra no carro com assistência mínima",
    "Entra no carro de forma independente",
    "Sai do carro com assistência",
    "Sai do carro de forma independente",
    // D — Cama (16–19)
    "Vira-se na cama",
    "Senta-se na cama com assistência",
    "Senta-se na cama de forma independente",
    "Deita-se e levanta-se da cama de forma independente",
    // E — Banheira/chuveiro (20–24)
    "Entra na banheira/chuveiro com assistência máxima",
    "Entra na banheira/chuveiro com assistência mínima",
    "Entra na banheira/chuveiro de forma independente",
    "Sai da banheira/chuveiro com assistência",
    "Sai da banheira/chuveiro de forma independente",
    // F — Locomoção interna — método (25–29)
    "Move-se em ambientes internos com assistência máxima",
    "Move-se em ambientes internos com assistência mínima",
    "Move-se em ambientes internos de forma independente (sem dispositivo)",
    "Move-se em ambientes internos usando dispositivo de auxílio",
    "Move-se em ambientes internos em cadeira de rodas de forma funcional",
    // G — Locomoção interna — distância/velocidade (30–34)
    "Locomove-se por curtas distâncias em ambientes internos",
    "Locomove-se por cômodos adjacentes",
    "Locomove-se por toda a residência",
    "Locomove-se em ambientes internos em ritmo funcional",
    "Locomove-se em ambientes internos carregando objetos",
    // H — Locomoção externa — método (35–39)
    "Move-se em ambientes externos com assistência máxima",
    "Move-se em ambientes externos com assistência mínima",
    "Move-se em ambientes externos de forma independente",
    "Move-se em ambientes externos usando dispositivo de auxílio",
    "Move-se em ambientes externos em cadeira de rodas de forma funcional",
    // I — Locomoção externa — distância/velocidade (40–44)
    "Locomove-se por curtas distâncias em ambientes externos",
    "Locomove-se em calçadas e áreas planas próximas",
    "Locomove-se em distâncias comunitárias usuais",
    "Locomove-se em ambientes externos em ritmo funcional",
    "Locomove-se em ambientes externos em terrenos irregulares leves",
    // J — Subir escadas (45–49)
    "Sobe degraus com assistência máxima",
    "Sobe degraus com assistência mínima / corrimão",
    "Sobe degraus alternando os pés com apoio",
    "Sobe um lance de escadas de forma independente",
    "Sobe escadas carregando objetos ou sem apoio excessivo",
    // K — Descer escadas (50–54)
    "Desce degraus com assistência máxima",
    "Desce degraus com assistência mínima / corrimão",
    "Desce degraus alternando os pés com apoio",
    "Desce um lance de escadas de forma independente",
    "Desce escadas carregando objetos ou sem apoio excessivo",
    // L — Resistência e terreno (55–59)
    "Mantém locomoção funcional por períodos prolongados",
    "Locomove-se em rampas leves",
    "Locomove-se em superfícies irregulares (grama, terra)",
    "Locomove-se em ambientes lotados com segurança",
    "Planeja e executa trajetos comunitários usuais",
  ],

  social_function: [
    // A — Compreensão (1–5)
    "Compreende o próprio nome e palavras familiares",
    "Compreende nomes de objetos e pessoas familiares",
    "Compreende frases simples de uma ação",
    "Compreende instruções de duas etapas",
    "Compreende conversas e histórias simples",
    // B — Expressão (6–10)
    "Usa gestos ou vocalizações para comunicar necessidades",
    "Usa palavras isoladas com intenção comunicativa",
    "Usa frases curtas para expressar necessidades",
    "Relata eventos simples ocorridos",
    "Expressa ideias com frases mais elaboradas",
    // C — Comunicação (11–15)
    "Inicia comunicação com adultos familiares",
    "Responde a perguntas simples",
    "Mantém turnos em conversas curtas",
    "Usa comunicação para obter informações",
    "Adapta a comunicação ao interlocutor/contexto",
    // D — Resolução de problemas (16–20)
    "Busca ajuda quando encontra dificuldade",
    "Tenta resolver problemas simples sozinho",
    "Usa estratégias básicas para contornar obstáculos",
    "Planeja passos simples para atingir um objetivo",
    "Avalia se a solução funcionou e tenta outra se necessário",
    // E — Interação social (21–25)
    "Demonstra interesse por outras pessoas",
    "Responde a interações sociais iniciadas por outros",
    "Inicia interações sociais simples",
    "Mantém interação por alguns minutos",
    "Ajusta comportamento social a regras básicas do contexto",
    // F — Brincar interativo (26–30)
    "Brinca próximo a outras crianças",
    "Participa de brincadeiras paralelas",
    "Participa de brincadeiras simples com turnos",
    "Coopera em jogos/brincadeiras estruturadas",
    "Negocia regras simples em brincadeiras",
    // G — Brincar com objetos (31–35)
    "Explora objetos de forma funcional",
    "Usa brinquedos de acordo com a função",
    "Realiza brincadeira simbólica simples",
    "Sequencia ações em brincadeira de faz-de-conta",
    "Cria e mantém uma brincadeira simbólica elaborada",
    // H — Participação com pares (36–40)
    "Tolera a presença de outras crianças",
    "Compartilha materiais com assistência",
    "Compartilha materiais de forma espontânea",
    "Participa de atividades em pequeno grupo",
    "Mantém amizades / preferências por pares",
    // I — Auto-informação (41–45)
    "Informa o próprio nome quando solicitado",
    "Informa idade ou características básicas",
    "Informa endereço ou dados familiares simples",
    "Relata preferências e aversões",
    "Fornece informações pessoais relevantes em contextos novos",
    // J — Orientação no tempo (46–50)
    "Compreende rotinas do dia (manhã/tarde/noite)",
    "Compreende sequências temporais simples (antes/depois)",
    "Associa atividades a momentos do dia",
    "Compreende dias da semana em rotina",
    "Usa noções de tempo para planejar atividades simples",
    // K — Tarefas domésticas (51–55)
    "Ajuda em tarefas simples quando solicitado",
    "Guarda brinquedos/objetos com assistência",
    "Guarda brinquedos/objetos de forma independente",
    "Participa de tarefas domésticas simples (arrumar mesa, etc.)",
    "Realiza tarefas domésticas simples de forma consistente",
    // L — Autoproteção (56–60)
    "Evita perigos óbvios com supervisão",
    "Reconhece situações de risco simples",
    "Busca adulto em situações de perigo",
    "Segue regras básicas de segurança",
    "Cuida da própria segurança em ambientes familiares",
    // M — Função na comunidade (61–65)
    "Participa de saídas comunitárias com assistência",
    "Comporta-se adequadamente em ambientes públicos familiares",
    "Segue regras básicas em ambientes comunitários",
    "Interage funcionalmente em serviços da comunidade (loja, etc.)",
    "Participa de atividades comunitárias com autonomia relativa",
  ],
};

export function assertPediCatalogIntegrity(): void {
  const expected: Record<PediArea, number> = {
    self_care: 73,
    mobility: 59,
    social_function: 65,
  };

  for (const area of Object.keys(expected) as PediArea[]) {
    const count = PEDI_ITEM_TEXTS[area].length;
    if (count !== expected[area]) {
      throw new Error(
        `Catálogo PEDI inválido para ${area}: ${count} ≠ ${expected[area]}`
      );
    }
  }
}
