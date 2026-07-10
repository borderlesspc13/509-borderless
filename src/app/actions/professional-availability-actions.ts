"use server";

import { requirePermission } from "@/lib/auth-guard";
import {
  isSlotDurationMinutes,
  mapRowsToWorkloadSettings,
  normalizeTimeValue,
  validateWorkloadSettings,
  type ProfessionalWorkloadSettings,
  type SlotDurationMinutes,
} from "@/lib/professional-availability";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

function mapDbTime(value: string) {
  return normalizeTimeValue(value) ?? value.slice(0, 5);
}

export async function getMyWorkloadSettingsAction(): Promise<
  ActionResult<ProfessionalWorkloadSettings>
> {
  const session = await requirePermission(PERMISSIONS.AGENDA_VIEW);
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("slot_duration_minutes")
    .eq("id", session.id)
    .maybeSingle();

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  const { data: rows, error: availabilityError } = await supabase
    .from("professional_availability")
    .select("weekday, start_time, end_time")
    .eq("user_id", session.id)
    .order("weekday")
    .order("start_time");

  if (availabilityError) {
    return { success: false, error: availabilityError.message };
  }

  const slotDuration = profile?.slot_duration_minutes ?? 60;

  return {
    success: true,
    data: mapRowsToWorkloadSettings(
      typeof slotDuration === "number" ? slotDuration : 60,
      (rows ?? []).map((row) => ({
        weekday: row.weekday,
        startTime: mapDbTime(row.start_time),
        endTime: mapDbTime(row.end_time),
      }))
    ),
  };
}

export async function saveMyWorkloadSettingsAction(
  settings: ProfessionalWorkloadSettings
): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.AGENDA_VIEW);
  const validationError = validateWorkloadSettings(settings);

  if (validationError) {
    return { success: false, error: validationError };
  }

  if (!isSlotDurationMinutes(settings.slotDurationMinutes)) {
    return {
      success: false,
      error: "Selecione uma duração válida entre 5 e 60 minutos.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const userId = session.id;
  const slotDurationMinutes: SlotDurationMinutes = settings.slotDurationMinutes;

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({
      slot_duration_minutes: slotDurationMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  const { error: deleteError } = await supabase
    .from("professional_availability")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  const inserts = settings.days.flatMap((day) =>
    day.windows.map((window) => ({
      user_id: userId,
      weekday: day.weekday,
      start_time: normalizeTimeValue(window.startTime) ?? window.startTime,
      end_time: normalizeTimeValue(window.endTime) ?? window.endTime,
    }))
  );

  if (inserts.length > 0) {
    const { error: insertError } = await supabase
      .from("professional_availability")
      .insert(inserts);

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  return { success: true };
}
