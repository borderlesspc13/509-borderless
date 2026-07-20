export const BODY_MARK_TYPES = [
  { value: "pain", label: "Dor", colorClass: "bg-amber-500", pinClass: "fill-amber-500 stroke-amber-700" },
  { value: "lesion", label: "Lesão", colorClass: "bg-red-500", pinClass: "fill-red-500 stroke-red-800" },
  { value: "missing_limb", label: "Ausência de membro", colorClass: "bg-violet-500", pinClass: "fill-violet-500 stroke-violet-800" },
  { value: "scar", label: "Cicatriz", colorClass: "bg-sky-500", pinClass: "fill-sky-500 stroke-sky-800" },
  { value: "other", label: "Outro", colorClass: "bg-slate-500", pinClass: "fill-slate-500 stroke-slate-700" },
] as const;

export type BodyMarkType = (typeof BODY_MARK_TYPES)[number]["value"];

export const BODY_VIEW_SIDES = [
  { value: "front", label: "Frente" },
  { value: "back", label: "Verso" },
] as const;

export type BodyViewSide = (typeof BODY_VIEW_SIDES)[number]["value"];

export function getBodyMarkTypeLabel(type: string) {
  return BODY_MARK_TYPES.find((item) => item.value === type)?.label ?? type;
}

export function getBodyMarkTypePinClass(type: string) {
  return (
    BODY_MARK_TYPES.find((item) => item.value === type)?.pinClass ??
    "fill-slate-500 stroke-slate-700"
  );
}

export function getBodyMarkTypeColorClass(type: string) {
  return (
    BODY_MARK_TYPES.find((item) => item.value === type)?.colorClass ??
    "bg-slate-500"
  );
}

export function getBodyViewSideLabel(side: string) {
  return BODY_VIEW_SIDES.find((item) => item.value === side)?.label ?? side;
}
