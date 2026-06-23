import type { Metadata } from "next";
import { Suspense } from "react";

import { ChatPageView } from "@/components/chat/chat-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Chat Interno",
  description:
    "Comunicação interna em tempo real entre recepção, terapeutas e equipe administrativa.",
};

export default async function ChatPage() {
  await requirePermission(PERMISSIONS.INTERNAL_MESSAGING);

  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Carregando chat...</p>}>
      <ChatPageView />
    </Suspense>
  );
}
