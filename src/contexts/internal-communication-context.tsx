"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  listNotificationsAction,
  listOnlineProfessionalsAction,
  markMessageReadAction,
  markNotificationReadAction,
  sendInternalMessageAction,
  updatePresenceAction,
} from "@/app/actions/internal-communication-actions";
import {
  getActivePatientWaitingNotifications,
  getUnreadNotificationCount,
  type OnlineProfessional,
} from "@/lib/internal-communication";
import { emitNotificationInsert } from "@/lib/notification-events";
import type {
  InternalMessageRow,
  InternalNotificationRow,
} from "@/lib/supabase/database.types";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type InternalCommunicationContextValue = {
  notifications: InternalNotificationRow[];
  messages: InternalMessageRow[];
  onlineProfessionals: OnlineProfessional[];
  unreadCount: number;
  waitingNotifications: InternalNotificationRow[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  refreshOnlineProfessionals: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markMessageRead: (messageId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<boolean>;
};

const InternalCommunicationContext =
  createContext<InternalCommunicationContextValue | null>(null);

type InternalCommunicationProviderProps = {
  children: React.ReactNode;
  userId: string;
};

export function InternalCommunicationProvider({
  children,
  userId,
}: InternalCommunicationProviderProps) {
  const [notifications, setNotifications] = useState<InternalNotificationRow[]>(
    []
  );
  const [messages, setMessages] = useState<InternalMessageRow[]>([]);
  const [onlineProfessionals, setOnlineProfessionals] = useState<
    OnlineProfessional[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const notificationsResult = await listNotificationsAction();

    if (notificationsResult.success && notificationsResult.data) {
      setNotifications(notificationsResult.data.notifications);
    }
  }, []);

  const refreshOnlineProfessionals = useCallback(async () => {
    const result = await listOnlineProfessionalsAction();

    if (result.success && result.data) {
      setOnlineProfessionals(result.data.professionals);
    }
  }, []);

  const markNotificationRead = useCallback(
    async (notificationId: string) => {
      const result = await markNotificationReadAction(notificationId);

      if (result.success) {
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        );
      }
    },
    []
  );

  const markMessageRead = useCallback(async (messageId: string) => {
    const result = await markMessageReadAction(messageId);

    if (result.success) {
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? { ...message, read_at: new Date().toISOString() }
            : message
        )
      );
    }
  }, []);

  const sendMessage = useCallback(
    async (receiverId: string, content: string) => {
      const result = await sendInternalMessageAction(receiverId, content);

      if (result.success && result.data?.message) {
        setMessages((current) => [result.data!.message, ...current]);
        return true;
      }

      return false;
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      setIsLoading(true);
      await Promise.all([refresh(), refreshOnlineProfessionals()]);
      if (isMounted) {
        setIsLoading(false);
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [refresh, refreshOnlineProfessionals]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createBrowserSupabaseClient();

    const notificationsChannel = supabase
      .channel(`internal-notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "internal_notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as InternalNotificationRow;
          setNotifications((current) => [notification, ...current]);
          emitNotificationInsert(notification);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "internal_notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as InternalNotificationRow;
          setNotifications((current) =>
            current.map((item) =>
              item.id === notification.id ? notification : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(notificationsChannel);
    };
  }, [userId]);

  useEffect(() => {
    void updatePresenceAction();

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void updatePresenceAction();
      }
    }, 60_000);

    const professionalsRefresh = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshOnlineProfessionals();
      }
    }, 60_000);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void updatePresenceAction();
        void refreshOnlineProfessionals();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(heartbeat);
      window.clearInterval(professionalsRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshOnlineProfessionals]);

  const value = useMemo<InternalCommunicationContextValue>(
    () => ({
      notifications,
      messages,
      onlineProfessionals,
      unreadCount: getUnreadNotificationCount(notifications),
      waitingNotifications: getActivePatientWaitingNotifications(notifications),
      isLoading,
      refresh,
      refreshOnlineProfessionals,
      markNotificationRead,
      markMessageRead,
      sendMessage,
    }),
    [
      notifications,
      messages,
      onlineProfessionals,
      isLoading,
      refresh,
      refreshOnlineProfessionals,
      markNotificationRead,
      markMessageRead,
      sendMessage,
    ]
  );

  return (
    <InternalCommunicationContext.Provider value={value}>
      {children}
    </InternalCommunicationContext.Provider>
  );
}

export function useInternalCommunication() {
  const context = useContext(InternalCommunicationContext);

  if (!context) {
    throw new Error(
      "useInternalCommunication deve ser usado dentro de InternalCommunicationProvider."
    );
  }

  return context;
}
