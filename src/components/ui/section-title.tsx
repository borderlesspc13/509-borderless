import { cn } from "@/lib/utils";

type SectionTitleProps = {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "p";
};

export function SectionTitle({
  children,
  className,
  as: Component = "h2",
}: SectionTitleProps) {
  return (
    <Component className={cn("app-section-title", className)}>
      {children}
    </Component>
  );
}
