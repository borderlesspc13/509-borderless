import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type AppSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
};

export function AppSearchField({
  value,
  onChange,
  placeholder = "Buscar...",
  id,
  className,
  disabled = false,
}: AppSearchFieldProps) {
  return (
    <label htmlFor={id} className={cn("app-search-field", className)}>
      <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </label>
  );
}
