"use server";

import { requirePermission } from "@/lib/auth-guard";
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
  buildAvatarStoragePath,
  CLINICAL_FILES_BUCKET,
  getAvatarFileExtension,
  type AvatarEntityType,
} from "@/lib/clinical-files";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function uploadAvatarFile(
  entityType: AvatarEntityType,
  entityId: string,
  file: File
): Promise<ActionResult<{ avatarUrl: string }>> {
  if (file.size === 0) {
    return { success: false, error: "Selecione uma imagem válida." };
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return { success: false, error: "A foto deve ter no máximo 5 MB." };
  }

  if (
    !AVATAR_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return {
      success: false,
      error: "Formato inválido. Use PNG, JPG ou WEBP.",
    };
  }

  const extension = getAvatarFileExtension(file.type);

  if (!extension) {
    return { success: false, error: "Formato de imagem não suportado." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const storagePath = buildAvatarStoragePath(entityType, entityId, extension);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(CLINICAL_FILES_BUCKET)
    .upload(storagePath, fileBuffer, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(CLINICAL_FILES_BUCKET).getPublicUrl(storagePath);

  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  if (entityType === "patient") {
    const { error } = await supabase
      .from("patients")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entityId);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entityId);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, data: { avatarUrl } };
}

export async function uploadPatientAvatarAction(
  patientId: string,
  formData: FormData
): Promise<ActionResult<{ avatarUrl: string }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return { success: false, error: "Selecione uma imagem válida." };
  }

  return uploadAvatarFile("patient", patientId, file);
}

export async function uploadProfessionalAvatarAction(
  professionalId: string,
  formData: FormData
): Promise<ActionResult<{ avatarUrl: string }>> {
  await requirePermission(PERMISSIONS.TEAM_MANAGE);

  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return { success: false, error: "Selecione uma imagem válida." };
  }

  return uploadAvatarFile("professional", professionalId, file);
}

export async function removePatientAvatarAction(
  patientId: string
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("patients")
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function removeProfessionalAvatarAction(
  professionalId: string
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.TEAM_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", professionalId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
