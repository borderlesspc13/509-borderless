"use client";

import { ChatProvider } from "@/contexts/chat-context";
import { useUserRole } from "@/hooks/use-user-role";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useUserRole();

  return <ChatProvider userId={id}>{children}</ChatProvider>;
}
