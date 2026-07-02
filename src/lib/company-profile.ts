import { formatCnpjDisplay } from "@/lib/clinic-settings";
import type { ClinicSettingsRow } from "@/lib/supabase/database.types";

export type CompanyProfile = {
  id: string;
  legalName: string;
  tradeName: string | null;
  cnpj: string | null;
  cnpjFormatted: string;
  logoUrl: string | null;
  planName: string;
  companyCode: string;
  createdAt: string;
  phone: string | null;
  mobilePhone: string | null;
  municipalRegistration: string | null;
  stateRegistration: string | null;
  email: string | null;
  contactName: string | null;
  website: string | null;
  zipCode: string | null;
  state: string | null;
  city: string | null;
  street: string | null;
  neighborhood: string | null;
  addressComplement: string | null;
  whatsappGuardianConfirmation: boolean;
  whatsappProfessionalNotification: boolean;
  appointmentNotificationHours: number;
};

export function buildFullAddress(profile: Pick<
  CompanyProfile,
  | "street"
  | "neighborhood"
  | "city"
  | "state"
  | "zipCode"
  | "addressComplement"
>) {
  const parts = [
    profile.street,
    profile.neighborhood,
    profile.city && profile.state
      ? `${profile.city} — ${profile.state}`
      : profile.city || profile.state,
    profile.zipCode ? `CEP ${profile.zipCode}` : null,
    profile.addressComplement,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

export function mapCompanyProfileRow(row: ClinicSettingsRow): CompanyProfile {
  return {
    id: row.id,
    legalName: row.nome_clinica,
    tradeName: row.trade_name,
    cnpj: row.cnpj,
    cnpjFormatted: formatCnpjDisplay(row.cnpj),
    logoUrl: row.logo_url,
    planName: row.plan_name ?? "Profissional",
    companyCode: row.company_code ?? "1190",
    createdAt: row.created_at,
    phone: row.phone,
    mobilePhone: row.mobile_phone,
    municipalRegistration: row.municipal_registration,
    stateRegistration: row.state_registration,
    email: row.email,
    contactName: row.contact_name,
    website: row.website,
    zipCode: row.zip_code,
    state: row.state,
    city: row.city,
    street: row.street,
    neighborhood: row.neighborhood,
    addressComplement: row.address_complement,
    whatsappGuardianConfirmation: row.whatsapp_guardian_confirmation,
    whatsappProfessionalNotification: row.whatsapp_professional_notification,
    appointmentNotificationHours: row.appointment_notification_hours,
  };
}

export function formatCompanyRegistrationDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
