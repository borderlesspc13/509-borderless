import { APP_NAME } from "@/lib/app-brand";
import { formatCnpjDisplay } from "@/lib/clinic-settings";
import { buildFullAddress } from "@/lib/company-profile";

/** Logo oficial da aplicação (fallback quando a clínica não tem logo própria). */
export const APP_BRAND_LOGO_PATH = "/brand/logo-nurse-care.png";

export const APP_BRAND_LOGO_ICON_PATH = "/brand/logo-icon.png";

/** Cores da identidade Nurse Care para documentos. */
export const DOCUMENT_BRAND_COLORS = {
  teal: "#5B9EA6",
  pink: "#C45B7A",
  navy: "#1B2A4A",
  muted: "#5B6472",
  border: "#D7DEE7",
  background: "#FFFFFF",
  text: "#111827",
} as const;

export type DocumentBranding = {
  clinicName: string;
  tradeName: string | null;
  legalName: string;
  cnpjFormatted: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  /** URL absoluta ou path público da logo a embutir no documento. */
  logoUrl: string;
  /** true quando a logo é a oficial da app (não a enviada pela clínica). */
  isAppLogo: boolean;
};

export const DEFAULT_DOCUMENT_BRANDING: DocumentBranding = {
  clinicName: APP_NAME,
  tradeName: APP_NAME,
  legalName: `${APP_NAME} Soluções em Saúde`,
  cnpjFormatted: null,
  address: null,
  phone: null,
  email: null,
  logoUrl: APP_BRAND_LOGO_PATH,
  isAppLogo: true,
};

export type ClinicDocumentBrandingRow = {
  nome_clinica: string;
  trade_name: string | null;
  cnpj: string | null;
  endereco_completo: string | null;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  address_complement: string | null;
  phone: string | null;
  mobile_phone: string | null;
  email: string | null;
  logo_url: string | null;
};

export function mapClinicRowToDocumentBranding(
  row: ClinicDocumentBrandingRow
): DocumentBranding {
  const structuredAddress = buildFullAddress({
    street: row.street,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    addressComplement: row.address_complement,
  });

  const address =
    structuredAddress ||
    (row.endereco_completo?.trim() ? row.endereco_completo.trim() : null);

  const phone = row.phone?.trim() || row.mobile_phone?.trim() || null;
  const email = row.email?.trim() || null;
  const clinicLogo = row.logo_url?.trim() || null;
  const clinicName = row.trade_name?.trim() || row.nome_clinica.trim() || APP_NAME;
  const legalName = row.nome_clinica.trim() || APP_NAME;
  const cnpjFormatted = formatCnpjDisplay(row.cnpj).trim() || null;

  return {
    clinicName,
    tradeName: row.trade_name?.trim() || null,
    legalName,
    cnpjFormatted: cnpjFormatted || null,
    address,
    phone,
    email,
    logoUrl: clinicLogo || APP_BRAND_LOGO_PATH,
    isAppLogo: !clinicLogo,
  };
}

export function resolveDocumentLogoUrl(
  branding: DocumentBranding,
  origin?: string
) {
  if (branding.logoUrl.startsWith("http://") || branding.logoUrl.startsWith("https://")) {
    return branding.logoUrl;
  }

  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${branding.logoUrl.startsWith("/") ? "" : "/"}${branding.logoUrl}`;
}

export function escapeDocumentHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildDocumentHeaderHtml(
  branding: DocumentBranding,
  options?: { logoUrl?: string; documentTitle?: string }
) {
  const logoUrl = options?.logoUrl ?? resolveDocumentLogoUrl(branding);
  const metaLines: string[] = [];

  if (branding.legalName && branding.legalName !== branding.clinicName) {
    metaLines.push(escapeDocumentHtml(branding.legalName));
  }

  if (branding.cnpjFormatted) {
    metaLines.push(`CNPJ ${escapeDocumentHtml(branding.cnpjFormatted)}`);
  }

  if (branding.address) {
    metaLines.push(escapeDocumentHtml(branding.address));
  }

  const contactParts = [branding.phone, branding.email].filter(Boolean);
  if (contactParts.length > 0) {
    metaLines.push(escapeDocumentHtml(contactParts.join(" · ")));
  }

  const metaHtml = metaLines
    .map(
      (line) =>
        `<p style="margin:2px 0 0;font-size:11px;line-height:1.45;color:${DOCUMENT_BRAND_COLORS.muted};">${line}</p>`
    )
    .join("");

  const titleBlock = options?.documentTitle
    ? `<p style="margin:10px 0 0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${DOCUMENT_BRAND_COLORS.navy};">${escapeDocumentHtml(options.documentTitle)}</p>`
    : "";

  return `
    <header style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding-bottom:18px;margin-bottom:24px;border-bottom:3px solid ${DOCUMENT_BRAND_COLORS.teal};">
      <div style="display:flex;align-items:center;gap:16px;min-width:0;">
        <img
          src="${escapeDocumentHtml(logoUrl)}"
          alt="${escapeDocumentHtml(branding.clinicName)}"
          width="180"
          height="60"
          style="height:56px;width:auto;max-width:200px;object-fit:contain;display:block;"
        />
        <div style="min-width:0;">
          <h1 style="margin:0;font-size:18px;line-height:1.25;color:${DOCUMENT_BRAND_COLORS.navy};font-family:Helvetica,Arial,sans-serif;">
            ${escapeDocumentHtml(branding.clinicName)}
          </h1>
          ${metaHtml}
          ${titleBlock}
        </div>
      </div>
      <div style="flex-shrink:0;text-align:right;">
        <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:${DOCUMENT_BRAND_COLORS.teal}18;color:${DOCUMENT_BRAND_COLORS.teal};font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;">
          Documento clínico
        </div>
      </div>
    </header>
  `;
}

export function buildDocumentFooterHtml(generatedAtLabel: string) {
  return `
    <div style="margin-top:28px;padding-top:12px;border-top:1px solid ${DOCUMENT_BRAND_COLORS.border};display:flex;justify-content:space-between;gap:16px;font-size:10px;color:${DOCUMENT_BRAND_COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
      <span>${escapeDocumentHtml(APP_NAME)}</span>
      <span>Gerado em ${escapeDocumentHtml(generatedAtLabel)}</span>
    </div>
  `;
}
