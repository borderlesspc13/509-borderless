"use client";

import { useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import {
  deriveBodyMetrics,
  type BodyModelType,
  type DerivedBodyMetrics,
} from "@/lib/body-map-3d/proportions";

/** Tom clínico azul-acinzentado (referência visual tipo manequim). */
const SKIN = {
  color: "#a8b7c8",
  roughness: 0.72,
  metalness: 0.06,
} as const;

type ClickHandler = (point: THREE.Vector3, partName: string) => void;

type CodedBodyProps = {
  type: BodyModelType;
  onPartClick?: ClickHandler;
};

function getClickProps(name: string, onPartClick?: ClickHandler) {
  return {
    name,
    castShadow: true as const,
    receiveShadow: true as const,
    onClick: (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      onPartClick?.(event.point.clone(), name);
    },
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      document.body.style.cursor = "crosshair";
    },
    onPointerOut: () => {
      document.body.style.cursor = "default";
    },
  };
}

function SoftMaterial() {
  return <meshStandardMaterial {...SKIN} />;
}

/** Cápsula afilada (ombro→cotovelo, coxa→joelho…). */
function CapsuleLimb({
  name,
  position,
  rotation,
  radius,
  length,
  onPartClick,
}: {
  name: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  radius: number;
  length: number;
  onPartClick?: ClickHandler;
}) {
  const click = getClickProps(name, onPartClick);
  // CapsuleGeometry: height = distância entre centros das hemisferas
  const height = Math.max(0.02, length - radius * 2);

  return (
    <mesh {...click} position={position} rotation={rotation}>
      <capsuleGeometry args={[radius, height, 8, 16]} />
      <SoftMaterial />
    </mesh>
  );
}

function Ball({
  name,
  position,
  radius,
  scale,
  onPartClick,
}: {
  name: string;
  position: [number, number, number];
  radius: number;
  scale?: [number, number, number];
  onPartClick?: ClickHandler;
}) {
  const click = getClickProps(name, onPartClick);
  return (
    <mesh {...click} position={position} scale={scale}>
      <sphereGeometry args={[radius, 28, 28]} />
      <SoftMaterial />
    </mesh>
  );
}

function buildTorsoProfile(m: DerivedBodyMetrics): THREE.Vector2[] {
  const isChild = m.type === "child";
  const topY = m.shoulderY;
  const bottomY = m.crotchY + m.H * 0.08;
  const h = topY - bottomY;

  // Raios relativos (silhueta ombro → peito → cintura → quadril)
  const shoulderR = m.torsoWidthTop * 0.48;
  const chestR = shoulderR * (isChild ? 0.92 : 0.95);
  const waistR = shoulderR * (isChild ? 0.78 : 0.68);
  const hipR = m.torsoWidthBottom * 0.52;
  const pelvisR = hipR * 0.9;

  const samples: Array<[number, number]> = [
    [0.0, pelvisR * 0.55],
    [0.08, pelvisR * 0.85],
    [0.18, hipR],
    [0.32, hipR * 0.98],
    [0.45, waistR * 1.05],
    [0.55, waistR],
    [0.68, chestR * 0.92],
    [0.8, chestR],
    [0.9, shoulderR * 0.96],
    [1.0, shoulderR * 0.72],
  ];

  return samples.map(([t, r]) => new THREE.Vector2(r, bottomY + t * h));
}

/**
 * Manequim clínico orgânico em primitivas (cápsulas, lathe, esferas).
 * A-pose, tronco com cintura/quadril, membros afilados — sem .glb.
 */
export function CodedBody({ type, onPartClick }: CodedBodyProps) {
  const m = useMemo(() => deriveBodyMetrics(type), [type]);
  const torsoPoints = useMemo(() => buildTorsoProfile(m), [m]);

  // A-pose: braços abertos ~18°
  const armOut = (18 * Math.PI) / 180;
  const shoulderDrop = m.H * 0.04;

  const shoulderLX = -m.shoulderHalfWidth * 0.92;
  const shoulderRX = m.shoulderHalfWidth * 0.92;
  const shoulderY = m.shoulderY - shoulderDrop;

  // Braço esquerdo em A-pose (local: -X, -Y)
  const upperArmMidL: [number, number, number] = [
    shoulderLX - Math.sin(armOut) * (m.upperArmLen * 0.5),
    shoulderY - Math.cos(armOut) * (m.upperArmLen * 0.5),
    0,
  ];
  const elbowL: [number, number, number] = [
    shoulderLX - Math.sin(armOut) * m.upperArmLen,
    shoulderY - Math.cos(armOut) * m.upperArmLen,
    0.02,
  ];
  const forearmMidL: [number, number, number] = [
    elbowL[0] - Math.sin(armOut * 0.85) * (m.forearmLen * 0.5),
    elbowL[1] - Math.cos(armOut * 0.85) * (m.forearmLen * 0.5),
    0.02,
  ];
  const wristL: [number, number, number] = [
    elbowL[0] - Math.sin(armOut * 0.85) * m.forearmLen,
    elbowL[1] - Math.cos(armOut * 0.85) * m.forearmLen,
    0.03,
  ];

  const upperArmMidR: [number, number, number] = [
    -upperArmMidL[0],
    upperArmMidL[1],
    upperArmMidL[2],
  ];
  const elbowR: [number, number, number] = [
    -elbowL[0],
    elbowL[1],
    elbowL[2],
  ];
  const forearmMidR: [number, number, number] = [
    -forearmMidL[0],
    forearmMidL[1],
    forearmMidL[2],
  ];
  const wristR: [number, number, number] = [
    -wristL[0],
    wristL[1],
    wristL[2],
  ];

  const hipLX = -m.hipHalfWidth * 0.78;
  const hipRX = m.hipHalfWidth * 0.78;
  const hipY = m.crotchY + m.H * 0.12;

  // Leve abertura das pernas
  const legOut = (4 * Math.PI) / 180;

  const thighMidL: [number, number, number] = [
    hipLX - Math.sin(legOut) * (m.thighLen * 0.45),
    (hipY + m.kneeY) / 2,
    0,
  ];
  const kneeL: [number, number, number] = [
    hipLX - Math.sin(legOut) * m.thighLen * 0.9,
    m.kneeY,
    0.01,
  ];
  const calfMidL: [number, number, number] = [
    kneeL[0] - Math.sin(legOut * 0.5) * (m.calfLen * 0.45),
    (m.kneeY + m.ankleY) / 2,
    0.01,
  ];
  const ankleL: [number, number, number] = [
    kneeL[0] - Math.sin(legOut * 0.5) * m.calfLen * 0.85,
    m.ankleY,
    0.02,
  ];

  const thighMidR: [number, number, number] = [
    -thighMidL[0],
    thighMidL[1],
    thighMidL[2],
  ];
  const kneeR: [number, number, number] = [-kneeL[0], kneeL[1], kneeL[2]];
  const calfMidR: [number, number, number] = [
    -calfMidL[0],
    calfMidL[1],
    calfMidL[2],
  ];
  const ankleR: [number, number, number] = [-ankleL[0], ankleL[1], ankleL[2]];

  const armRotL: [number, number, number] = [0, 0, armOut];
  const armRotR: [number, number, number] = [0, 0, -armOut];
  const legRotL: [number, number, number] = [0, 0, legOut];
  const legRotR: [number, number, number] = [0, 0, -legOut];

  const chestZ = m.torsoDepth * 0.28;
  const bellyZ = m.torsoDepth * 0.22;
  const isChild = type === "child";

  return (
    <group>
      {/* ——— Cabeça (oval) ——— */}
      <Ball
        name="Cabeça"
        position={[0, m.headCenterY, 0]}
        radius={m.headR}
        scale={[0.92, 1.12, 0.98]}
        onPartClick={onPartClick}
      />
      {/* Nariz sutil */}
      <Ball
        name="Cabeça"
        position={[0, m.headCenterY - m.headR * 0.05, m.headR * 0.78]}
        radius={m.headR * 0.14}
        scale={[0.7, 1.1, 1.3]}
        onPartClick={onPartClick}
      />

      {/* ——— Pescoço ——— */}
      <CapsuleLimb
        name="Pescoço"
        position={[0, m.neckCenterY, 0]}
        radius={m.neckR * 0.95}
        length={m.neckH * 1.15}
        onPartClick={onPartClick}
      />

      {/* ——— Tronco (Lathe = silhueta orgânica) ——— */}
      <mesh
        {...getClickProps("Tronco", onPartClick)}
        scale={[1, 1, m.torsoDepth / (m.torsoWidthTop * 0.55)]}
      >
        <latheGeometry args={[torsoPoints, 48]} />
        <SoftMaterial />
      </mesh>

      {/* Volume peitoral / abdomen (sobreposição suave) */}
      <Ball
        name="Tronco"
        position={[0, m.chestY, chestZ * 0.35]}
        radius={m.H * (isChild ? 0.28 : 0.32)}
        scale={[1.35, 0.85, 0.7]}
        onPartClick={onPartClick}
      />
      <Ball
        name="Tronco"
        position={[0, m.navelY, bellyZ * 0.4]}
        radius={m.H * (isChild ? 0.26 : 0.28)}
        scale={[1.15, 0.95, 0.75]}
        onPartClick={onPartClick}
      />
      {/* Quadril / glúteo */}
      <Ball
        name="Tronco"
        position={[0, m.crotchY + m.H * 0.22, -m.torsoDepth * 0.15]}
        radius={m.H * 0.3}
        scale={[1.45, 0.75, 0.85]}
        onPartClick={onPartClick}
      />

      {/* ——— Ombros ——— */}
      <Ball
        name="Ombro esquerdo"
        position={[shoulderLX, shoulderY, 0]}
        radius={m.jointR * 1.05}
        onPartClick={onPartClick}
      />
      <Ball
        name="Ombro direito"
        position={[shoulderRX, shoulderY, 0]}
        radius={m.jointR * 1.05}
        onPartClick={onPartClick}
      />

      {/* ——— Braços (A-pose) ——— */}
      <CapsuleLimb
        name="Braço esquerdo"
        position={upperArmMidL}
        rotation={armRotL}
        radius={m.upperArmR}
        length={m.upperArmLen}
        onPartClick={onPartClick}
      />
      <CapsuleLimb
        name="Braço direito"
        position={upperArmMidR}
        rotation={armRotR}
        radius={m.upperArmR}
        length={m.upperArmLen}
        onPartClick={onPartClick}
      />
      <Ball
        name="Cotovelo esquerdo"
        position={elbowL}
        radius={m.jointR * 0.78}
        onPartClick={onPartClick}
      />
      <Ball
        name="Cotovelo direito"
        position={elbowR}
        radius={m.jointR * 0.78}
        onPartClick={onPartClick}
      />
      <CapsuleLimb
        name="Antebraço esquerdo"
        position={forearmMidL}
        rotation={[0, 0, armOut * 0.85]}
        radius={m.forearmR}
        length={m.forearmLen}
        onPartClick={onPartClick}
      />
      <CapsuleLimb
        name="Antebraço direito"
        position={forearmMidR}
        rotation={[0, 0, -armOut * 0.85]}
        radius={m.forearmR}
        length={m.forearmLen}
        onPartClick={onPartClick}
      />

      {/* Mãos */}
      <Ball
        name="Mão esquerda"
        position={wristL}
        radius={m.handR}
        scale={[0.7, 1.15, 0.45]}
        onPartClick={onPartClick}
      />
      <Ball
        name="Mão direita"
        position={wristR}
        radius={m.handR}
        scale={[0.7, 1.15, 0.45]}
        onPartClick={onPartClick}
      />

      {/* ——— Quadril / pernas ——— */}
      <Ball
        name="Quadril esquerdo"
        position={[hipLX, hipY, 0]}
        radius={m.jointR * 1.15}
        scale={[1.1, 1, 1.05]}
        onPartClick={onPartClick}
      />
      <Ball
        name="Quadril direito"
        position={[hipRX, hipY, 0]}
        radius={m.jointR * 1.15}
        scale={[1.1, 1, 1.05]}
        onPartClick={onPartClick}
      />

      <CapsuleLimb
        name="Coxa esquerda"
        position={thighMidL}
        rotation={legRotL}
        radius={m.thighR}
        length={m.thighLen}
        onPartClick={onPartClick}
      />
      <CapsuleLimb
        name="Coxa direita"
        position={thighMidR}
        rotation={legRotR}
        radius={m.thighR}
        length={m.thighLen}
        onPartClick={onPartClick}
      />
      <Ball
        name="Joelho esquerdo"
        position={kneeL}
        radius={m.jointR * 0.88}
        onPartClick={onPartClick}
      />
      <Ball
        name="Joelho direito"
        position={kneeR}
        radius={m.jointR * 0.88}
        onPartClick={onPartClick}
      />
      <CapsuleLimb
        name="Panturrilha esquerda"
        position={calfMidL}
        rotation={[0, 0, legOut * 0.5]}
        radius={m.calfR}
        length={m.calfLen}
        onPartClick={onPartClick}
      />
      <CapsuleLimb
        name="Panturrilha direita"
        position={calfMidR}
        rotation={[0, 0, -legOut * 0.5]}
        radius={m.calfR}
        length={m.calfLen}
        onPartClick={onPartClick}
      />

      {/* Pés */}
      <mesh
        {...getClickProps("Pé esquerdo", onPartClick)}
        position={[ankleL[0], m.footR * 0.55, m.footLen * 0.22]}
        scale={[1, 0.55, 1]}
      >
        <capsuleGeometry args={[m.footR * 0.85, m.footLen * 0.55, 6, 12]} />
        <SoftMaterial />
      </mesh>
      <mesh
        {...getClickProps("Pé direito", onPartClick)}
        position={[ankleR[0], m.footR * 0.55, m.footLen * 0.22]}
        scale={[1, 0.55, 1]}
      >
        <capsuleGeometry args={[m.footR * 0.85, m.footLen * 0.55, 6, 12]} />
        <SoftMaterial />
      </mesh>
    </group>
  );
}
