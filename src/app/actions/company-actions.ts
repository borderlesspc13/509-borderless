"use server";

import { requireAdmin } from "@/lib/auth-guard";
import {
  buildFullAddress,
  mapCompanyProfileRow,
  type CompanyProfile,
} from "@/lib/company-profile";
import {
  CLINIC_SETTINGS_ID,
  normalizeOptionalText,
} from "@/lib/clinic-settings";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ClinicSettingsRow } from "@/lib/supabase/database.types";

type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

async function loadClinicSettingsRow() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase não configurado." as const, row: null };
  }

  const { data, error } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("id", CLINIC_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    return { error: error.message, row: null };
  }

  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from("clinic_settings")
      .insert({ id: CLINIC_SETTINGS_ID, nome_clinica: "Nurse Care" })
      .select("*")
      .single();

    if (insertError) {
      return { error: insertError.message, row: null };
    }

    return { error: null, row: inserted as ClinicSettingsRow };
  }

  return { error: null, row: data as ClinicSettingsRow };
}

export async function getCompanyProfileAction(): Promise<
  ActionResult<CompanyProfile>
> {
  await requireAdmin();

  const { error, row } = await loadClinicSettingsRow();

  if (error || !row) {
    return { success: false, error: error ?? "Empresa não encontrada." };
  }

  return { success: true, data: mapCompanyProfileRow(row) };
}

export type UpdateCompanyProfileInput = {
  legalName: string;
  tradeName?: string;
  phone?: string;
  mobilePhone?: string;
  municipalRegistration?: string;
  stateRegistration?: string;
  email?: string;
  contactName?: string;
  website?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  street?: string;
  neighborhood?: string;
  addressComplement?: string;
};

export async function updateCompanyProfileAction(
  input: UpdateCompanyProfileInput
): Promise<ActionResult<CompanyProfile>> {
  await requireAdmin();

  const legalName = input.legalName.trim();
  const tradeName = normalizeOptionalText(input.tradeName);

  if (!legalName) {
    return { success: false, error: "Informe o nome da empresa." };
  }

  if (!tradeName) {
    return { success: false, error: "Informe o nome fantasia." };
  }

  const email = normalizeOptionalText(input.email);

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Informe um e-mail válido." };
  }

  const { error: loadError, row: current } = await loadClinicSettingsRow();

  if (loadError || !current) {
    return {
      success: false,
      error: loadError ?? "Empresa não encontrada.",
    };
  }

  const profileDraft = {
    street: normalizeOptionalText(input.street),
    neighborhood: normalizeOptionalText(input.neighborhood),
    city: normalizeOptionalText(input.city),
    state: normalizeOptionalText(input.state),
    zipCode: normalizeOptionalText(input.zipCode),
    addressComplement: normalizeOptionalText(input.addressComplement),
  };

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("clinic_settings")
    .update({
      nome_clinica: legalName,
      trade_name: tradeName,
      phone: normalizeOptionalText(input.phone),
      mobile_phone: normalizeOptionalText(input.mobilePhone),
      municipal_registration: normalizeOptionalText(input.municipalRegistration),
      state_registration: normalizeOptionalText(input.stateRegistration),
      email,
      contact_name: normalizeOptionalText(input.contactName),
      website: normalizeOptionalText(input.website),
      zip_code: profileDraft.zipCode,
      state: profileDraft.state,
      city: profileDraft.city,
      street: profileDraft.street,
      neighborhood: profileDraft.neighborhood,
      address_complement: profileDraft.addressComplement,
      endereco_completo: buildFullAddress(profileDraft),
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Dados da empresa salvos com sucesso.",
    data: mapCompanyProfileRow(data as ClinicSettingsRow),
  };
}

export type UpdateCompanySchedulingSettingsInput = {
  whatsappGuardianConfirmation: boolean;
  whatsappProfessionalNotification: boolean;
  appointmentNotificationHours: number;
};

export async function updateCompanySchedulingSettingsAction(
  input: UpdateCompanySchedulingSettingsInput
): Promise<ActionResult<CompanyProfile>> {
  await requireAdmin();

  if (
    !Number.isFinite(input.appointmentNotificationHours) ||
    input.appointmentNotificationHours < 1
  ) {
    return {
      success: false,
      error: "Informe ao menos 1 hora de antecedência para notificação.",
    };
  }

  const { error: loadError, row: current } = await loadClinicSettingsRow();

  if (loadError || !current) {
    return {
      success: false,
      error: loadError ?? "Empresa não encontrada.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("clinic_settings")
    .update({
      whatsapp_guardian_confirmation: input.whatsappGuardianConfirmation,
      whatsapp_professional_notification: input.whatsappProfessionalNotification,
      appointment_notification_hours: Math.round(
        input.appointmentNotificationHours
      ),
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Configurações de agendamento salvas com sucesso.",
    data: mapCompanyProfileRow(data as ClinicSettingsRow),
  };
}
