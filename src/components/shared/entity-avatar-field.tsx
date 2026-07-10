"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, UserRound, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EntityAvatarFieldProps = {
  name?: string;
  avatarUrl: string | null;
  previewUrl?: string | null;
  onFileSelected?: (file: File | null) => void;
  onRemove?: () => void;
  disabled?: boolean;
  isUploading?: boolean;
  size?: "md" | "lg";
  className?: string;
};

export function EntityAvatarField({
  name = "avatar",
  avatarUrl,
  previewUrl,
  onFileSelected,
  onRemove,
  disabled = false,
  isUploading = false,
  size = "lg",
  className,
}: EntityAvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayUrl = localPreview ?? previewUrl ?? avatarUrl;
  const sizeClass = size === "lg" ? "size-32" : "size-20";

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    if (!file) {
      setLocalPreview(null);
      onFileSelected?.(null);
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setLocalPreview(nextPreview);
    onFileSelected?.(file);
  }

  function handleRemove() {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    setLocalPreview(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onFileSelected?.(null);
    onRemove?.();
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <div
          className={cn(
            "flex items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted/30 text-muted-foreground",
            sizeClass
          )}
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt="Foto"
              className="size-full object-cover"
            />
          ) : (
            <UserRound
              className={size === "lg" ? "size-14" : "size-8"}
              aria-hidden
            />
          )}
        </div>

        <Button
          type="button"
          size="icon"
          variant="outline"
          className="absolute right-1 bottom-1 size-8 rounded-full"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          aria-label="Selecionar foto"
        >
          {isUploading ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Camera className="size-3.5" aria-hidden />
          )}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        disabled={disabled || isUploading}
        onChange={handleFileChange}
      />

      {displayUrl ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground"
          disabled={disabled || isUploading}
          onClick={handleRemove}
        >
          <X className="size-3.5" aria-hidden />
          Remover foto
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP · até 5 MB</p>
      )}
    </div>
  );
}
