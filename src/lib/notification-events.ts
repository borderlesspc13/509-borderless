import type { InternalNotificationRow } from "@/lib/supabase/database.types";

type NotificationInsertEvent = {
  notification: InternalNotificationRow;
};

const listeners = new Set<(event: NotificationInsertEvent) => void>();

export function subscribeNotificationInsert(
  listener: (event: NotificationInsertEvent) => void
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function emitNotificationInsert(notification: InternalNotificationRow) {
  for (const listener of listeners) {
    listener({ notification });
  }
}
