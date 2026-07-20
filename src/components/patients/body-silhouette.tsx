"use client";

import {
  BODY_MARK_TYPES,
  getBodyMarkTypePinClass,
  type BodyMarkType,
  type BodyViewSide,
} from "@/lib/body-map-format";
import { cn } from "@/lib/utils";

export type BodyMapMarkDisplay = {
  id: string;
  viewSide: BodyViewSide;
  xPct: number;
  yPct: number;
  markType: BodyMarkType;
};

type BodySilhouetteProps = {
  side: BodyViewSide;
  marks: BodyMapMarkDisplay[];
  selectedMarkId?: string | null;
  readOnly?: boolean;
  onCanvasClick?: (xPct: number, yPct: number) => void;
  onMarkClick?: (markId: string) => void;
  className?: string;
};

function FrontSilhouette() {
  return (
    <g fill="var(--muted)" stroke="var(--border)" strokeWidth="2">
      {/* Head */}
      <ellipse cx="100" cy="36" rx="22" ry="26" />
      {/* Neck */}
      <rect x="90" y="58" width="20" height="16" rx="4" />
      {/* Torso */}
      <path d="M62 74 C58 74 52 78 50 88 L46 170 C45 188 52 198 68 200 L132 200 C148 198 155 188 154 170 L150 88 C148 78 142 74 138 74 Z" />
      {/* Arms */}
      <path d="M52 88 C40 92 28 110 24 140 L22 178 C21 186 28 190 34 186 L48 150 L52 110 Z" />
      <path d="M148 88 C160 92 172 110 176 140 L178 178 C179 186 172 190 166 186 L152 150 L148 110 Z" />
      {/* Legs */}
      <path d="M70 200 L66 320 C65 340 68 360 78 380 L86 400 C90 408 98 406 100 396 L102 280 L100 200 Z" />
      <path d="M130 200 L134 320 C135 340 132 360 122 380 L114 400 C110 408 102 406 100 396 L98 280 L100 200 Z" />
    </g>
  );
}

function BackSilhouette() {
  return (
    <g fill="var(--muted)" stroke="var(--border)" strokeWidth="2">
      <ellipse cx="100" cy="36" rx="22" ry="26" />
      <rect x="90" y="58" width="20" height="16" rx="4" />
      <path d="M62 74 C58 74 52 78 50 88 L46 170 C45 188 52 198 68 200 L132 200 C148 198 155 188 154 170 L150 88 C148 78 142 74 138 74 Z" />
      {/* Spine hint */}
      <path
        d="M100 80 L100 195"
        fill="none"
        stroke="var(--border)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.7"
      />
      <path d="M52 88 C40 92 28 110 24 140 L22 178 C21 186 28 190 34 186 L48 150 L52 110 Z" />
      <path d="M148 88 C160 92 172 110 176 140 L178 178 C179 186 172 190 166 186 L152 150 L148 110 Z" />
      <path d="M70 200 L66 320 C65 340 68 360 78 380 L86 400 C90 408 98 406 100 396 L102 280 L100 200 Z" />
      <path d="M130 200 L134 320 C135 340 132 360 122 380 L114 400 C110 408 102 406 100 396 L98 280 L100 200 Z" />
    </g>
  );
}

export function BodySilhouette({
  side,
  marks,
  selectedMarkId,
  readOnly = false,
  onCanvasClick,
  onMarkClick,
  className,
}: BodySilhouetteProps) {
  const sideMarks = marks.filter((mark) => mark.viewSide === side);

  function handleClick(event: React.MouseEvent<SVGSVGElement>) {
    if (readOnly || !onCanvasClick) {
      return;
    }

    const target = event.target as SVGElement;
    if (target.closest("[data-body-mark]")) {
      return;
    }

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xPct = ((event.clientX - rect.left) / rect.width) * 100;
    const yPct = ((event.clientY - rect.top) / rect.height) * 100;
    onCanvasClick(xPct, yPct);
  }

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 200 420"
        className={cn(
          "mx-auto h-auto w-full max-w-[220px] select-none",
          !readOnly && "cursor-crosshair"
        )}
        role="img"
        aria-label={`Silhueta corporal — ${side === "front" ? "frente" : "verso"}`}
        onClick={handleClick}
      >
        {side === "front" ? <FrontSilhouette /> : <BackSilhouette />}

        {sideMarks.map((mark) => (
          <g
            key={mark.id}
            data-body-mark={mark.id}
            transform={`translate(${(mark.xPct / 100) * 200} ${(mark.yPct / 100) * 420})`}
            className={cn(!readOnly && "cursor-pointer")}
            onClick={(event) => {
              event.stopPropagation();
              onMarkClick?.(mark.id);
            }}
          >
            <circle
              r={selectedMarkId === mark.id ? 9 : 7}
              className={cn(
                getBodyMarkTypePinClass(mark.markType),
                selectedMarkId === mark.id && "stroke-[3]"
              )}
              strokeWidth={2}
            />
            <circle r={2.5} className="fill-white" />
          </g>
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {BODY_MARK_TYPES.map((type) => (
          <span
            key={type.value}
            className="inline-flex items-center gap-1.5 text-[0.65rem] text-muted-foreground"
          >
            <span className={cn("size-2.5 rounded-full", type.colorClass)} />
            {type.label}
          </span>
        ))}
      </div>
    </div>
  );
}
