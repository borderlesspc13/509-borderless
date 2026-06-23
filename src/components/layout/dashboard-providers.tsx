"use client";

import { ChatMessageToastListener } from "@/components/chat/chat-message-toast-listener";
import { InternalCommunicationProvider } from "@/contexts/internal-communication-context";
import { ToastProvider } from "@/contexts/toast-context";
import { UserRoleProvider } from "@/contexts/user-role-context";
import type { AppUserSession } from "@/lib/user-profile";

type DashboardProvidersProps = {
  children: React.ReactNode;
  session: AppUserSession;
};

export function DashboardProviders({
  children,
  session,
}: DashboardProvidersProps) {
  return (
    <UserRoleProvider session={session}>
      <ToastProvider>
        <InternalCommunicationProvider userId={session.id}>
          <ChatMessageToastListener />
          {children}
        </InternalCommunicationProvider>
      </ToastProvider>
    </UserRoleProvider>
  );
}
