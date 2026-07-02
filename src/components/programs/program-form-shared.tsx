"use client";

import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PROGRAM_TEXT_MAX_LENGTH,
  getRemainingCharacters,
} from "@/lib/program-format";
import { cn } from "@/lib/utils";

export const programInputClassName = "h-11 w-full";

export function ProgramFormField({
  id,
  label,
  required,
  children,
  className,
  hint,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-sm font-medium text-muted-foreground">
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </Label>
        {hint ? (
          <span title={hint}>
            <Info className="size-3.5 text-muted-foreground" aria-hidden />
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function ProgramCharacterTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const remaining = getRemainingCharacters(value);

  return (
    <div className="space-y-1">
      <Textarea
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value.slice(0, PROGRAM_TEXT_MAX_LENGTH))
        }
        placeholder={placeholder}
        rows={rows}
        className="resize-y"
      />
      <p className="text-right text-xs text-muted-foreground">
        {remaining} / {PROGRAM_TEXT_MAX_LENGTH} caracteres restantes
      </p>
    </div>
  );
}

export const programTabTriggerClassName =
  "rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground sm:text-sm";
