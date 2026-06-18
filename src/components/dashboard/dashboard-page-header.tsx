import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type DashboardPageHeaderProps = {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
};

export function DashboardPageHeader({
  title,
  breadcrumbs = [{ label: "Home", href: "/dashboard" }],
  actions,
}: DashboardPageHeaderProps) {
  return (
    <div className="app-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="app-screen-title">{title}</h1>
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <span key={`${item.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? (
                  <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                ) : null}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-medium text-foreground" : undefined}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
