# Acessus — Guia de Padrão de UI

Documento de referência para reproduzir a identidade visual e os padrões de interface do app **Acessus** (Portal Imobiliário). Use este arquivo como contexto em ferramentas externas (ChatGPT, Claude, Figma AI, etc.) ao criar telas, componentes ou protótipos compatíveis com o app existente.

---

## 1. Visão geral

| Aspecto | Padrão |
|---------|--------|
| **Produto** | App mobile de portal imobiliário (React Native + Expo) |
| **Marca** | **acessus** — sempre em minúsculas no logotipo tipográfico |
| **Idioma** | Português (Brasil) — textos, labels, placeholders e formatação monetária |
| **Estilo geral** | Limpo, card-based, tons de azul como cor dominante, fundos claros e sombras suaves |
| **Ícones** | `lucide-react-native` — traço fino, tamanhos entre 14px e 24px |
| **Estilização** | `StyleSheet.create` inline por tela/componente (sem theme centralizado) |

---

## 2. Paleta de cores

### 2.1 Azuis da marca (dois eixos coexistem)

O app usa **dois azuis principais** em contextos diferentes:

| Token | Hex | Uso |
|-------|-----|-----|
| **Brand Blue** | `#0c61b2` | AppBar, títulos de seção, preços em cards, botão "Anuncie Aqui", filtros circulares, sombras de destaque |
| **Action Blue** | `#4B83FF` | Splash, login, onboarding, links, botões de auth, modais info |
| **Deep Blue** | `#1E3A8A` | Detalhe do imóvel, perfil, filtros avançados, onboarding primário, ícones de características |

> Ao criar telas novas dentro do fluxo logado (home, favoritos, perfil), prefira **Brand Blue** (`#0c61b2`). No fluxo de autenticação e splash, prefira **Action Blue** (`#4B83FF`).

### 2.2 Cor de destaque da marca

| Token | Hex | Uso |
|-------|-----|-----|
| **Accent Yellow** | `#e9ef05` | Fundo exclusivo da tela de cadastro (Register) |

### 2.3 Fundos e superfícies

| Token | Hex | Uso |
|-------|-----|-----|
| **Background App** | `#F8FAFC` | Fundo principal das telas logadas |
| **Background Auth** | `#F3F4F6` | Login, onboarding |
| **Surface White** | `#FFFFFF` | Cards, headers, modais, formulários |
| **Search Field** | `#E8EDF3` | Campo de busca na home |
| **Input Fill** | `#F9FAFB` | Inputs em formulários de auth |
| **Image Placeholder** | `#CBD5E1` | Fallback quando não há imagem |

### 2.4 Texto

| Token | Hex | Uso |
|-------|-----|-----|
| **Text Primary** | `#1F2937` | Títulos, nomes, valores principais |
| **Text Secondary** | `#374151` | Labels de formulário |
| **Text Body** | `#4B5563` | Descrições, características |
| **Text Muted** | `#6B7280` | Subtítulos, contadores, metadados |
| **Placeholder** | `#9CA3AF` | Placeholders de input e ícones inativos |
| **Text Dark** | `#111827` | Títulos de onboarding |

### 2.5 Bordas e divisores

| Token | Hex |
|-------|-----|
| **Border Default** | `#E5E7EB` |
| **Border Light** | `#F3F4F6` |
| **Border Circle** | `#D1E3F5` |

### 2.6 Cores semânticas por tipo de negócio

Usadas em badges, chips e filtros circulares:

| Tipo | Hex | Label |
|------|-----|-------|
| Venda | `#10B981` | Venda / Vendas |
| Aluguel | `#3B82F6` | Aluguel / Locação |
| Temporada | `#F59E0B` | Temporada |
| Lotes | `#0c61b2` | Lotes |

### 2.7 Feedback e estados

| Estado | Primária | Fundo claro |
|--------|----------|-------------|
| Sucesso | `#10B981` | `#ECFDF5` |
| Erro | `#EF4444` / `#DC2626` | `#FEE2E2` / `#FEF2F2` |
| Aviso | `#F59E0B` | `#FEF3C7` |
| Info | `#4B83FF` / `#3B82F6` | `#EFF6FF` |
| WhatsApp | `#25D366` | — |
| Desabilitado | `#9CA3AF` | — |

### 2.8 Planos de assinatura (cores exclusivas)

| Plano | Hex |
|-------|-----|
| Basic | `#F97316` |
| Impulsionar | `#9333EA` |
| Comercial | `#2563EB` |

---

## 3. Tipografia

Não há fonte customizada — usa a fonte do sistema (San Francisco / Roboto).

### Escala de tamanhos

| Papel | Tamanho | Peso | Exemplo |
|-------|---------|------|---------|
| Logo grande | 36px | 600 | "acessus" no login |
| Logo AppBar | 20px | bold | "acessus" no header |
| Hero / Welcome | 28px | 600–800 | "Bem vindo..." |
| Título de seção (carousel) | 22px | bold | "Destaques", "Lançamentos" |
| Título de tela | 20–24px | bold | "Favoritos", título do imóvel |
| Preço em destaque | 20–22px | bold | Valor do imóvel |
| Subtítulo | 16–18px | 400–600 | Descrições, labels de botão |
| Corpo | 14–16px | 400–500 | Texto corrido, inputs |
| Label pequeno | 11–13px | 500–700 | Detalhes de card, chips |
| Badge / contador | 10–12px | bold | Badges de notificação |

### Regras tipográficas

- **Marca "acessus"**: sempre `textTransform: 'lowercase'`
- **Títulos de filtro**: `textTransform: 'uppercase'`, `letterSpacing: 0.6`, cor `#0c61b2`
- **Preços**: formatados com `toLocaleString('pt-BR')` — ex.: `R$ 450.000`, `R$ 2.500/mês`, `R$ 350/dia`
- **Line-height**: 20–26px em textos de corpo; títulos de card com altura fixa para 2 linhas

---

## 4. Espaçamento e layout

### Grid base

| Token | Valor | Onde |
|-------|-------|------|
| **Padding horizontal padrão** | 24px | Maioria das telas e seções |
| **Padding horizontal alternativo** | 16–20px | Detalhe do imóvel, cards internos |
| **Safe area top** | 60px | Headers, AppBar, telas com back |
| **Gap pequeno** | 4–8px | Ícone + texto, chips |
| **Gap médio** | 12–14px | Botões empilhados, filtros circulares |
| **Gap grande** | 16–20px | Seções, cards |
| **Padding bottom scroll** | 24–40px | Listas e scroll views |

### Raio de borda (border-radius)

| Elemento | Raio |
|----------|------|
| Cards de imóvel (carousel) | 20px |
| Cards de lista / formulários | 12–16px |
| Botões primários | 12px |
| Inputs | 12px |
| Campo de busca | 10px |
| Botões circulares de filtro | 38px (elemento 76×76) |
| Badges / chips | 12–16px |
| Botões de ícone (AppBar) | 8px |
| Botão favorito sobre imagem | 20px (circular 36×36) |
| Pills de filtro (FilterModal) | 20px |

---

## 5. Sombras e elevação

Padrão recorrente de sombra suave:

```
shadowColor: '#000'
shadowOffset: { width: 0, height: 2–4 }
shadowOpacity: 0.1–0.25
shadowRadius: 4–12
elevation: 4–8
```

**Exceções com sombra colorida** (botões primários de auth):

```
shadowColor: '#4B83FF' (ou cor do botão)
shadowOpacity: 0.2–0.3
```

**Filtros circulares** usam sombra na cor da marca:

```
shadowColor: '#0c61b2'
shadowOpacity: 0.12
shadowRadius: 6
elevation: 3
```

---

## 6. Componentes e padrões visuais

### 6.1 AppBar (header principal)

- Barra azul `#0c61b2` com padding top 60px
- Logo + texto "acessus" alinhados à esquerda (logo 40×40)
- Ações à direita: Bell, Heart, User (20px, branco)
- Botões de ícone: fundo `rgba(255,255,255,0.2)`, 36×36, border-radius 8
- Badge de contagem: `#EF4444`, min-width 20, fonte 10px bold, posição top-right
- Container externo branco com sombra leve (elevation 4)

### 6.2 Campo de busca + CTA

- Row horizontal abaixo do AppBar
- Input: flex 1, fundo `#E8EDF3`, ícone Search `#9CA3AF`, border-radius 10
- Botão "Anuncie Aqui" / "Criar Anúncio": `#0c61b2`, texto branco 13px weight 700

### 6.3 Botões circulares de filtro

- 76×76px, border-radius 38
- Estado inativo: fundo branco, borda `#D1E3F5`, texto `#0c61b2`
- Estado ativo: fundo na cor do filtro (padrão `#0c61b2` ou cor semântica), texto branco
- Scroll horizontal com título uppercase acima
- `activeOpacity: 0.85`

### 6.4 Cards de imóvel (carousel)

- Largura: ~78% da tela (`SCREEN_WIDTH * 0.78`)
- Altura fixa ~460px, snap horizontal
- Imagem superior 220px com overlay gradiente inferior `rgba(0,0,0,0.2)`
- Badges no canto superior esquerdo (tipo + "Destaque" em `#1E3A8A`)
- Botão favorito: canto superior direito, fundo `rgba(0,0,0,0.5)`, coração branco/vermelho `#EF4444`
- Conteúdo: título 18px bold, preço 22px `#0c61b2`
- Localização: MapPin 14px + texto muted
- Rodapé do card: quartos / banheiros / área com ícones `#0c61b2`, separadores verticais `#E5E7EB`

### 6.5 Cards de lista (favoritos, etc.)

- Border-radius 16, sombra leve, overflow hidden
- Imagem 200px altura
- Preço em `#1E3A8A` (variante do carousel)
- Ícones de detalhe em `#6B7280` (mais discretos que no carousel)

### 6.6 Formulários (auth)

- Card branco flutuante: border-radius 16, padding 20–24, sombra elevation 4
- Labels: 16px weight 600, `#1F2937` ou `#374151`
- Inputs: border 1px `#E5E7EB`, border-radius 12, padding vertical 14
- Botão primário: `#4B83FF`, padding vertical 16, texto 16–18px bold branco
- Botão desabilitado: `#9CA3AF`, sem sombra
- Links secundários: `#4B83FF`, weight 500–600

### 6.7 Botões primário / secundário (onboarding)

- **Primário**: fundo `#1E3A8A`, texto branco, border-radius 12, padding vertical 14
- **Secundário**: fundo branco, borda 1px `#1E3A8A`, texto `#1E3A8A`

### 6.8 Header de telas internas (com back)

- Fundo branco, border-bottom `#E5E7EB`
- Padding top 60, horizontal 24
- Título centralizado 20px bold `#1F2937`
- Back: ArrowLeft 24px (cor `#1F2937` ou `#1E3A8A` conforme tela)

### 6.9 Header sobre imagem (detalhe do imóvel)

- Botões flutuantes: fundo `rgba(0,0,0,0.4)`, border-radius 8, padding 10
- Ícones brancos 24px
- Indicadores de página: dots 8×8, ativo branco, inativo `rgba(255,255,255,0.5)`

### 6.10 Modais

**AlertModal (centro, fade):**
- Overlay `rgba(0,0,0,0.5)`
- Card branco border-radius 16, header colorido conforme tipo
- Botões side-by-side: cancelar `#F3F4F6` / confirmar na cor do tipo

**FilterModal (pageSheet slide):**
- Header branco com X, título central, "Limpar" em vermelho
- Pills toggle: inativo `#F3F4F6`, ativo `#1E3A8A`
- Footer fixo com botão "Aplicar Filtros" `#1E3A8A`

### 6.11 Toast (notificações temporárias)

- Posição top, slide-in animado
- Altura mínima 56px, border-radius 12
- Cores sólidas: info `#3B82F6`, success `#10B981`, error `#EF4444`
- Texto branco 15px weight 500 + ícone lucide + botão fechar

### 6.12 Filter chips

- Container branco com border-bottom
- Chips: fundo `#F3F4F6`, border-radius 16, label muted + valor primary
- "Limpar Todos": fundo `#FEF2F2`, texto `#EF4444`

### 6.13 Empty states

- Ícone grande (64px) em `#E5E7EB` ou `#6B7280`
- Título 24px bold `#1F2937`
- Descrição 16px `#6B7280`, centralizado

### 6.14 Splash screen

- Fundo `#4B83FF` fullscreen
- Logo centralizado com animação: fade + scale (0.75 → 1.06 → 1) + translateY
- Duração ~1.6s antes de transicionar

---

## 7. Carrosséis e scroll

- **Horizontal**: `showsHorizontalScrollIndicator: false`, `nestedScrollEnabled`, `bounces: false`
- **Carousel de imóveis**: `snapToInterval`, `decelerationRate: "fast"`, spacing 16px
- **Shopping carousel**: cards 150×100, border-radius 12, título "acessus Shopping" 20px bold `#0c61b2`
- **Vertical**: fundo `#F8FAFC`, indicador oculto na maioria das telas

---

## 8. Iconografia

| Contexto | Biblioteca | Tamanho | Cor |
|----------|-----------|---------|-----|
| AppBar | Bell, Heart, User | 20px | `#FFFFFF` |
| Busca | Search | 18px | `#9CA3AF` |
| Cards imóvel | Bed, Bath, Square, MapPin | 14–18px | `#0c61b2` ou `#6B7280` |
| Detalhe | ArrowLeft, Heart, Share2, Phone, Mail, MessageCircle | 20–24px | Branco (header) / `#1E3A8A` (corpo) |
| Perfil | User, Mail, Phone, MapPin, Settings, LogOut | 16–24px | `#1E3A8A` ou `#6B7280` |
| Toast | Info, CheckCircle, XCircle, X | 18–20px | Branco |
| Senha | Eye, EyeOff | 20px | `#6B7280` |

---

## 9. Interação e estados

| Comportamento | Valor |
|---------------|-------|
| `activeOpacity` (cards/botões) | 0.85 – 0.9 |
| Botão loading | Texto muda ("Entrando..."), fundo cinza, disabled |
| Favorito ativo | Heart `#EF4444` com fill |
| Switch (filtros) | Track off `#E5E7EB`, on `#1E3A8A`, thumb branco |
| Hit slop (ícones pequenos) | 8–10px |

---

## 10. Fluxos visuais por área

### Autenticação
- **Splash**: azul `#4B83FF`
- **Onboarding**: fundo `#F3F4F6`, botões `#1E3A8A`
- **Login**: fundo `#F3F4F6`, acentos `#4B83FF`, mensagem de boas-vindas azul
- **Cadastro**: fundo amarelo `#e9ef05` (exclusivo), logo branco, botões `#4B83FF`

### App logado
- **Home**: AppBar `#0c61b2`, fundo `#F8FAFC`, carousels e filtros circulares
- **Detalhe**: hero image 300px, seções com divisores, CTAs de contato `#1E3A8A` + WhatsApp `#25D366`
- **Favoritos / Perfil / Configurações**: header branco, cards brancos, acentos `#1E3A8A`
- **Assinatura**: cards de plano com cores distintas (laranja, roxo, azul)

---

## 11. Checklist para novas telas

Ao criar uma tela compatível com o Acessus, verifique:

- [ ] Fundo `#F8FAFC` (logado) ou `#F3F4F6` (auth)
- [ ] Padding horizontal 24px
- [ ] Safe area top ~60px em headers
- [ ] Títulos de seção em uppercase `#0c61b2` com letter-spacing (se for filtro/navegação)
- [ ] Cards brancos com border-radius 12–20 e sombra suave
- [ ] Botão primário: azul da marca + texto branco bold + border-radius 12
- [ ] Textos em português com formatação pt-BR para valores
- [ ] Ícones lucide-react-native (não emoji, não Material Icons)
- [ ] Badges de tipo de imóvel nas cores semânticas corretas
- [ ] Empty states com ícone grande muted + título + descrição
- [ ] Marca "acessus" em minúsculas quando exibir logotipo tipográfico

---

## 12. Anti-padrões (evitar)

- Não usar tema escuro — o app é 100% light mode
- Não misturar Material Design ou Ionicons — apenas Lucide
- Não usar gradientes (exceto overlay sutil em imagens de imóvel)
- Não usar border-radius muito agudo (< 8px) em cards
- Não usar vermelho como cor primária de marca — reservado para erro/favorito/badge
- Não capitalizar "Acessus" no logotipo tipográfico
- Evitar criar um terceiro tom de azul — usar os três já definidos conforme contexto

---

## 13. Referência rápida de tokens (copiar/colar)

```json
{
  "brand": {
    "name": "acessus",
    "primary": "#0c61b2",
    "action": "#4B83FF",
    "deep": "#1E3A8A",
    "accent": "#e9ef05"
  },
  "background": {
    "app": "#F8FAFC",
    "auth": "#F3F4F6",
    "surface": "#FFFFFF",
    "search": "#E8EDF3",
    "input": "#F9FAFB"
  },
  "text": {
    "primary": "#1F2937",
    "secondary": "#374151",
    "body": "#4B5563",
    "muted": "#6B7280",
    "placeholder": "#9CA3AF"
  },
  "border": {
    "default": "#E5E7EB",
    "light": "#F3F4F6",
    "circle": "#D1E3F5"
  },
  "propertyType": {
    "venda": "#10B981",
    "aluguel": "#3B82F6",
    "temporada": "#F59E0B",
    "lotes": "#0c61b2"
  },
  "feedback": {
    "success": "#10B981",
    "error": "#EF4444",
    "warning": "#F59E0B",
    "info": "#3B82F6",
    "whatsapp": "#25D366"
  },
  "radius": {
    "button": 12,
    "card": 16,
    "cardLarge": 20,
    "search": 10,
    "circle": 38,
    "chip": 16
  },
  "spacing": {
    "screenHorizontal": 24,
    "safeTop": 60,
    "gapSm": 8,
    "gapMd": 12,
    "gapLg": 16
  }
}
```

---

*Gerado a partir da análise do código-fonte do projeto 253-PortalImob (React Native / Expo).*
