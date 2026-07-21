/**
 * Proporções anatômicas para manequim clínico em primitivas.
 *
 * Fontes:
 * - Cânone clássico de 8 cabeças (adulto idealizado / modelagem 3D)
 * - Landmarks: queixo=1, mamilos=2, umbigo=3, virilha=4, joelho≈6, solo=8
 * - Ombros ≈ 2–2.5 cabeças de largura
 * - Criança: cânone ~5.5–6 cabeças (jovem); cabeça proporcionalmente maior
 *   (Anatomy for Sculptors; literatura de desenvolvimento infantil)
 */

export type BodyModelType = "adult" | "child";

export type BodyProportions = {
  /** Unidades de cabeça (Hu) da figura completa. */
  headUnits: number;
  /** Altura de 1 cabeça em unidades do mundo. */
  headSize: number;
  /** Largura dos ombros em Hu. */
  shoulderWidthHu: number;
  /** Largura do quadril em Hu. */
  hipWidthHu: number;
  /** Profundidade do tronco (Z) relativa à largura. */
  torsoDepthScale: number;
  /** Escala relativa dos membros. */
  limbScale: number;
};

export const BODY_PROPORTIONS: Record<BodyModelType, BodyProportions> = {
  /** Adulto com silhueta mais orgânica (ombros ~2 Hu, quadril um pouco mais largo). */
  adult: {
    headUnits: 8,
    headSize: 0.25,
    shoulderWidthHu: 2.05,
    hipWidthHu: 1.75,
    torsoDepthScale: 0.48,
    limbScale: 1,
  },
  /** Cânone ~6 Hu: cabeça maior relativa; membros mais curtos. */
  child: {
    headUnits: 6,
    headSize: 0.27,
    shoulderWidthHu: 1.65,
    hipWidthHu: 1.5,
    torsoDepthScale: 0.52,
    limbScale: 0.94,
  },
};

export type DerivedBodyMetrics = {
  type: BodyModelType;
  H: number;
  totalHeight: number;
  /** Centros Y (pés em y=0). */
  headCenterY: number;
  chinY: number;
  neckCenterY: number;
  shoulderY: number;
  chestY: number;
  navelY: number;
  crotchY: number;
  kneeY: number;
  ankleY: number;
  shoulderHalfWidth: number;
  hipHalfWidth: number;
  torsoWidthTop: number;
  torsoWidthBottom: number;
  torsoDepth: number;
  upperArmLen: number;
  forearmLen: number;
  thighLen: number;
  calfLen: number;
  upperArmR: number;
  forearmR: number;
  thighR: number;
  calfR: number;
  jointR: number;
  handR: number;
  footLen: number;
  footR: number;
  neckH: number;
  neckR: number;
  headR: number;
};

/**
 * Deriva métricas em coordenadas de mundo a partir do cânone de cabeças.
 * Origem: solo entre os pés (0,0,0); Y positivo = para cima.
 */
export function deriveBodyMetrics(type: BodyModelType): DerivedBodyMetrics {
  const p = BODY_PROPORTIONS[type];
  const H = p.headSize;
  const totalHeight = p.headUnits * H;
  const limb = p.limbScale;

  // Landmarks verticais (adulto 8 Hu; criança 6 Hu — escalados pelo total)
  const t = totalHeight / (p.headUnits * H); // = 1, mas deixa explícito
  void t;

  const headCenterY = totalHeight - H * 0.5;
  const chinY = totalHeight - H;
  const neckH = H * (type === "child" ? 0.28 : 0.32);
  const neckCenterY = chinY - neckH * 0.5;
  const shoulderY = chinY - neckH - H * 0.08;

  // Tronco: ombro → virilha = ~3 Hu adulto; ~2.2 Hu criança
  const torsoHu = type === "child" ? 2.15 : 3.0;
  const crotchY = shoulderY - torsoHu * H;
  const chestY = shoulderY - H * (type === "child" ? 0.7 : 0.95);
  const navelY = shoulderY - H * (type === "child" ? 1.35 : 1.9);

  const legLen = crotchY; // até o solo
  const thighLen = legLen * 0.48 * limb;
  const calfLen = legLen * 0.42 * limb;
  const kneeY = crotchY - thighLen;
  const ankleY = Math.max(H * 0.12, kneeY - calfLen);

  const shoulderHalfWidth = (p.shoulderWidthHu * H) / 2;
  const hipHalfWidth = (p.hipWidthHu * H) / 2;
  const torsoWidthTop = shoulderHalfWidth * 1.55;
  const torsoWidthBottom = hipHalfWidth * 1.85;
  const torsoDepth = torsoWidthTop * p.torsoDepthScale;

  const armReach = shoulderY - crotchY;
  const upperArmLen = armReach * 0.42 * limb;
  const forearmLen = armReach * 0.4 * limb;

  return {
    type,
    H,
    totalHeight,
    headCenterY,
    chinY,
    neckCenterY,
    shoulderY,
    chestY,
    navelY,
    crotchY,
    kneeY,
    ankleY,
    shoulderHalfWidth,
    hipHalfWidth,
    torsoWidthTop,
    torsoWidthBottom,
    torsoDepth,
    upperArmLen,
    forearmLen,
    thighLen,
    calfLen,
    upperArmR: H * 0.155,
    forearmR: H * 0.12,
    thighR: H * 0.195,
    calfR: H * 0.135,
    jointR: H * 0.155,
    handR: H * 0.13,
    footLen: H * 0.52,
    footR: H * 0.11,
    neckH,
    neckR: H * 0.16,
    headR: H * 0.46,
  };
}

/** Bounds para converter clique 3D ↔ x_pct/y_pct do banco. */
export function getBodyBounds(metrics: DerivedBodyMetrics) {
  const halfW = metrics.shoulderHalfWidth + metrics.upperArmLen * 0.35;
  return {
    minX: -halfW - 0.15,
    maxX: halfW + 0.15,
    minY: 0,
    maxY: metrics.totalHeight,
    halfWidth: halfW + 0.15,
  };
}

export function worldPointToPct(
  point: { x: number; y: number; z: number },
  metrics: DerivedBodyMetrics
): { xPct: number; yPct: number; viewSide: "front" | "back" } {
  const bounds = getBodyBounds(metrics);
  const xPct = ((point.x - bounds.minX) / (bounds.maxX - bounds.minX)) * 100;
  const yPct = ((bounds.maxY - point.y) / (bounds.maxY - bounds.minY)) * 100;
  return {
    xPct: Math.min(100, Math.max(0, Number(xPct.toFixed(3)))),
    yPct: Math.min(100, Math.max(0, Number(yPct.toFixed(3)))),
    viewSide: point.z >= 0 ? "front" : "back",
  };
}

export function pctToWorldPoint(
  xPct: number,
  yPct: number,
  viewSide: "front" | "back",
  metrics: DerivedBodyMetrics,
  zOverride?: number
): { x: number; y: number; z: number } {
  const bounds = getBodyBounds(metrics);
  const x = bounds.minX + (xPct / 100) * (bounds.maxX - bounds.minX);
  const y = bounds.maxY - (yPct / 100) * (bounds.maxY - bounds.minY);
  const z =
    zOverride ??
    (viewSide === "front" ? metrics.torsoDepth * 0.55 : -metrics.torsoDepth * 0.55);
  return { x, y, z };
}

export type BodyMap3DMeta = {
  x: number;
  y: number;
  z: number;
  part: string;
  model: BodyModelType;
};

const META_PREFIX = "⟦mapa3d⟧";

export function encodeNotesWith3D(
  userNotes: string | null | undefined,
  meta: BodyMap3DMeta
): string {
  const line = `${META_PREFIX}${JSON.stringify(meta)}`;
  const rest = userNotes?.trim() ?? "";
  return rest ? `${line}\n${rest}` : line;
}

export function parseNotes3D(notes: string | null | undefined): {
  meta: BodyMap3DMeta | null;
  userNotes: string;
} {
  if (!notes) {
    return { meta: null, userNotes: "" };
  }

  const lines = notes.split("\n");
  const first = lines[0] ?? "";
  if (!first.startsWith(META_PREFIX)) {
    return { meta: null, userNotes: notes };
  }

  try {
    const meta = JSON.parse(first.slice(META_PREFIX.length)) as BodyMap3DMeta;
    return {
      meta,
      userNotes: lines.slice(1).join("\n").trim(),
    };
  } catch {
    return { meta: null, userNotes: notes };
  }
}
