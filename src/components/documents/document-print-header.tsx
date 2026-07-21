"use client";

import { useEffect, useState } from "react";

import { getDocumentBrandingAction } from "@/app/actions/document-branding-actions";
import {
  APP_BRAND_LOGO_PATH,
  DEFAULT_DOCUMENT_BRANDING,
  type DocumentBranding,
} from "@/lib/document-branding";
import { cn } from "@/lib/utils";

type DocumentPrintHeaderProps = {
  documentTitle: string;
  subtitle?: string;
  className?: string;
};

/**
 * Cabeçalho institucional visível apenas na impressão / PDF do navegador.
 */
export function DocumentPrintHeader({
  documentTitle,
  subtitle,
  className,
}: DocumentPrintHeaderProps) {
  const [branding, setBranding] = useState<DocumentBranding>(
    DEFAULT_DOCUMENT_BRANDING
  );

  useEffect(() => {
    let cancelled = false;

    void getDocumentBrandingAction().then((result) => {
      if (!cancelled && result.success && result.data) {
        setBranding(result.data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const logoSrc = branding.logoUrl || APP_BRAND_LOGO_PATH;
  const metaParts = [
    branding.legalName !== branding.clinicName ? branding.legalName : null,
    branding.cnpjFormatted ? `CNPJ ${branding.cnpjFormatted}` : null,
    branding.address,
    [branding.phone, branding.email].filter(Boolean).join(" · ") || null,
  ].filter(Boolean);

  return (
    <header
      className={cn(
        "mb-6 hidden border-b-[3px] border-[#5B9EA6] pb-4 print:block",
        className
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <img
            src={logoSrc}
            alt={branding.clinicName}
            width={200}
            height={64}
            className="h-14 w-auto max-w-[200px] object-contain"
          />
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-tight text-[#1B2A4A]">
              {branding.clinicName}
            </p>
            {metaParts.map((line) => (
              <p key={line} className="text-[11px] leading-snug text-[#5B6472]">
                {line}
              </p>
            ))}
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1B2A4A]">
              {documentTitle}
            </p>
            {subtitle ? (
              <p className="text-xs text-[#5B6472]">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#5B9EA6]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#5B9EA6]">
          Documento clínico
        </span>
      </div>
    </header>
  );
}
