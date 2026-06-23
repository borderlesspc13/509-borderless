import type { InternalNotificationRow } from "@/lib/supabase/database.types";

export const ONLINE_THRESHOLD_MS = 90_000;

export type OnlineProfessional = {
  id: string;
  fullName: string;
  profile: string;
  lastSeenAt: string;
  isOnline: boolean;
};

export function isUserOnline(lastSeenAt: string, now = Date.now()) {
  return now - new Date(lastSeenAt).getTime() <= ONLINE_THRESHOLD_MS;
}

export function getUnreadNotificationCount(
  notifications: InternalNotificationRow[]
) {
  return notifications.filter((notification) => !notification.read_at).length;
}

export function getUnreadChatMessageCount(
  notifications: InternalNotificationRow[]
) {
  return notifications.filter(
    (notification) =>
      notification.type === "chat_message" && !notification.read_at
  ).length;
}

export function getActivePatientWaitingNotifications(
  notifications: InternalNotificationRow[]
) {
  return notifications.filter(
    (notification) =>
      notification.type === "patient_waiting" && !notification.read_at
  );
}
