import type { PatientRow } from "@/lib/supabase/database.types";

export const supportLevelItems = [
  { label: "Nível 1", value: "1" },
  { label: "Nível 2", value: "2" },
  { label: "Nível 3", value: "3" },
] as const;

export const healthPlanItems = [
  { label: "Particular", value: "particular" },
  { label: "TRINO SAÚDE", value: "trino" },
] as const;

export type PatientFormState = {
  fullName: string;
  cpf: string;
  guardianName: string;
  guardianName2: string;
  guardianPhone: string;
  guardianEmail: string;
  diagnosis: string;
  birthDate: string;
  notes: string;
  zipCode: string;
  state: string;
  city: string;
  street: string;
  neighborhood: string;
  addressComplement: string;
  gender: string;
  maritalStatus: string;
  rg: string;
  rgIssuer: string;
  profession: string;
  website: string;
  birthplace: string;
  contact: string;
  phone: string;
  healthPlan: string;
  healthPlanIdentifier: string;
  supportLevel: string;
};

export const emptyPatientFormState: PatientFormState = {
  fullName: "",
  cpf: "",
  guardianName: "",
  guardianName2: "",
  guardianPhone: "",
  guardianEmail: "",
  diagnosis: "",
  birthDate: "",
  notes: "",
  zipCode: "",
  state: "",
  city: "",
  street: "",
  neighborhood: "",
  addressComplement: "",
  gender: "",
  maritalStatus: "",
  rg: "",
  rgIssuer: "",
  profession: "",
  website: "",
  birthplace: "",
  contact: "",
  phone: "",
  healthPlan: "",
  healthPlanIdentifier: "",
  supportLevel: "",
};

export function patientRowToFormState(patient: PatientRow): PatientFormState {
  return {
    fullName: patient.full_name,
    cpf: patient.cpf ?? "",
    guardianName: patient.guardian_name ?? "",
    guardianName2: patient.guardian_name_2 ?? "",
    guardianPhone: patient.guardian_phone ?? "",
    guardianEmail: patient.guardian_email ?? "",
    diagnosis: patient.diagnosis ?? "",
    birthDate: patient.birth_date ?? "",
    notes: patient.notes ?? "",
    zipCode: patient.zip_code ?? "",
    state: patient.state ?? "",
    city: patient.city ?? "",
    street: patient.street ?? "",
    neighborhood: patient.neighborhood ?? "",
    addressComplement: patient.address_complement ?? "",
    gender: patient.gender ?? "",
    maritalStatus: patient.marital_status ?? "",
    rg: patient.rg ?? "",
    rgIssuer: patient.rg_issuer ?? "",
    profession: patient.profession ?? "",
    website: patient.website ?? "",
    birthplace: patient.birthplace ?? "",
    contact: patient.contact ?? "",
    phone: patient.phone ?? "",
    healthPlan: patient.health_plan ?? "",
    healthPlanIdentifier: patient.health_plan_identifier ?? "",
    supportLevel: patient.support_level ?? "",
  };
}

export function getSupportLevelLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return supportLevelItems.find((item) => item.value === value)?.label ?? value;
}

export function getHealthPlanLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return healthPlanItems.find((item) => item.value === value)?.label ?? value;
}
