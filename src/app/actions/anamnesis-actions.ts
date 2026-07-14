"use server";

import { revalidatePath } from "next/cache";

import { requireServerUserSession } from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AnamnesisRecord = {
  id: string;
  patientId: string;
  professionalId: string;
  anamnesisType: string;
  formData: any;
  createdAt: string;
  updatedAt: string;
};

export async function saveAnamnesisAction({
  patientId,
  anamnesisType,
  formData,
}: {
  patientId: string;
  anamnesisType: string;
  formData: any;
}) {
  const session = await requireServerUserSession();
  const supabase = await createServerSupabaseClient();
  
  if (!supabase) return { success: false, error: "Falha na conexão" };

  const { data, error } = await supabase
    .from("patient_anamnesis")
    .insert({
      patient_id: patientId,
      professional_id: session.user.id,
      anamnesis_type: anamnesisType,
      form_data: formData,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving anamnesis:", error);
    return { success: false, error: "Falha ao salvar a anamnese" };
  }

  revalidatePath(`/paciente/${patientId}/prontuario`);
  return { success: true, data };
}

export async function getAnamnesisListAction(patientId: string): Promise<AnamnesisRecord[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("patient_anamnesis")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map(row => ({
    id: row.id,
    patientId: row.patient_id,
    professionalId: row.professional_id,
    anamnesisType: row.anamnesis_type,
    formData: row.form_data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
