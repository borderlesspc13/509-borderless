"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";

import { CodedBody } from "@/components/patients/body-map-3d/coded-body";
import {
  BODY_MARK_TYPES,
  getBodyMarkTypeColorClass,
  type BodyMarkType,
  type BodyViewSide,
} from "@/lib/body-map-format";
import {
  deriveBodyMetrics,
  pctToWorldPoint,
  worldPointToPct,
  type BodyModelType,
} from "@/lib/body-map-3d/proportions";
import { cn } from "@/lib/utils";

export type BodyMap3DMark = {
  id: string;
  viewSide: BodyViewSide;
  xPct: number;
  yPct: number;
  markType: BodyMarkType;
  severity?: number | null;
  position3d?: { x: number; y: number; z: number } | null;
};

type BodyMapCanvasProps = {
  modelType: BodyModelType;
  marks: BodyMap3DMark[];
  selectedMarkId?: string | null;
  readOnly?: boolean;
  onBodyClick?: (payload: {
    xPct: number;
    yPct: number;
    viewSide: BodyViewSide;
    bodyPart: string;
    position3d: { x: number; y: number; z: number };
  }) => void;
  onMarkClick?: (markId: string) => void;
  className?: string;
};

function markColor(type: BodyMarkType, severity: number | null | undefined) {
  if (type === "pain" && typeof severity === "number") {
    // Intensidade: âmbar → vermelho
    const t = Math.min(10, Math.max(0, severity)) / 10;
    const r = Math.round(245 + (220 - 245) * t);
    const g = Math.round(158 + (38 - 158) * t);
    const b = Math.round(11 + (38 - 11) * t);
    return `rgb(${r},${g},${b})`;
  }

  const map: Record<BodyMarkType, string> = {
    pain: "#f59e0b",
    lesion: "#ef4444",
    missing_limb: "#8b5cf6",
    scar: "#0ea5e9",
    other: "#64748b",
  };
  return map[type];
}

function Markers({
  marks,
  modelType,
  selectedMarkId,
  onMarkClick,
}: {
  marks: BodyMap3DMark[];
  modelType: BodyModelType;
  selectedMarkId?: string | null;
  onMarkClick?: (markId: string) => void;
}) {
  const metrics = useMemo(() => deriveBodyMetrics(modelType), [modelType]);

  return (
    <group>
      {marks.map((mark) => {
        const point = mark.position3d
          ? mark.position3d
          : pctToWorldPoint(mark.xPct, mark.yPct, mark.viewSide, metrics);
        const selected = mark.id === selectedMarkId;
        const color = markColor(mark.markType, mark.severity);
        const radius = selected ? 0.045 : 0.032;

        return (
          <mesh
            key={mark.id}
            position={[point.x, point.y, point.z]}
            onClick={(event) => {
              event.stopPropagation();
              onMarkClick?.(mark.id);
            }}
          >
            <sphereGeometry args={[radius, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={selected ? 0.45 : 0.2}
              roughness={0.35}
              metalness={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Scene({
  modelType,
  marks,
  selectedMarkId,
  readOnly,
  onBodyClick,
  onMarkClick,
}: Omit<BodyMapCanvasProps, "className">) {
  const metrics = useMemo(() => deriveBodyMetrics(modelType), [modelType]);

  return (
    <>
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[2.2, 4.5, 2.8]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-2.5, 2, -1.5]} intensity={0.35} />

      <group position={[0, -metrics.totalHeight * 0.48, 0]}>
        <CodedBody
          type={modelType}
          onPartClick={
            readOnly
              ? undefined
              : (point, partName) => {
                  const mapped = worldPointToPct(point, metrics);
                  onBodyClick?.({
                    xPct: mapped.xPct,
                    yPct: mapped.yPct,
                    viewSide: mapped.viewSide,
                    bodyPart: partName,
                    position3d: {
                      x: point.x,
                      y: point.y,
                      z: point.z,
                    },
                  });
                }
          }
        />
        <Markers
          marks={marks}
          modelType={modelType}
          selectedMarkId={selectedMarkId}
          onMarkClick={onMarkClick}
        />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.35}
          scale={3.2}
          blur={2.2}
          far={2.5}
        />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={1.4}
        maxDistance={4.2}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.85}
        target={[0, 0.05, 0]}
      />
    </>
  );
}

export function BodyMapCanvas({
  modelType,
  marks,
  selectedMarkId,
  readOnly = false,
  onBodyClick,
  onMarkClick,
  className,
}: BodyMapCanvasProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/70 bg-[#0b1220]",
        "h-[min(62vh,28rem)] min-h-[16rem] w-full touch-none sm:h-[min(68vh,32rem)]",
        className
      )}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0.9, 0.55, 2.35], fov: 42, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = "none";
        }}
      >
        <Suspense fallback={null}>
          <Scene
            modelType={modelType}
            marks={marks}
            selectedMarkId={selectedMarkId}
            readOnly={readOnly}
            onBodyClick={onBodyClick}
            onMarkClick={onMarkClick}
          />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-8">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          {BODY_MARK_TYPES.map((item) => (
            <span
              key={item.value}
              className="inline-flex items-center gap-1.5 text-[0.65rem] font-medium text-white/90"
            >
              <span
                className={cn("size-2.5 rounded-full", getBodyMarkTypeColorClass(item.value))}
                aria-hidden
              />
              {item.label}
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-center text-[0.65rem] text-white/65">
          Arraste para orbitar · toque no corpo para marcar · pinça para zoom
        </p>
      </div>
    </div>
  );
}
