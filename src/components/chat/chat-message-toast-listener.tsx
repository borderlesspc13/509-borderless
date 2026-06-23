"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/contexts/toast-context";
import { getActiveChatConversationId } from "@/lib/chat-active-conversation";
import { subscribeNotificationInsert } from "@/lib/notification-events";

function getConversationIdFromMetadata(metadata: unknown) {
  if (
    typeof metadata === "object" &&
    metadata !== null &&
    "conversation_id" in metadata &&
    typeof metadata.conversation_id === "string"
  ) {
    return metadata.conversation_id;
  }

  return null;
}

function getChatToastContent(notification: {
  title: string;
  body: string;
}) {
  if (notification.title === "Nova mensagem") {
    const separatorIndex = notification.body.indexOf(":");

    if (separatorIndex > 0) {
      return {
        title: notification.body.slice(0, separatorIndex).trim(),
        description: notification.body.slice(separatorIndex + 1).trim(),
      };
    }
  }

  return {
    title: notification.title,
    description: notification.body,
  };
}

export function ChatMessageToastListener() {
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    return subscribeNotificationInsert(({ notification }) => {
      if (notification.type !== "chat_message") {
        return;
      }

      const conversationId = getConversationIdFromMetadata(notification.metadata);

      if (
        conversationId &&
        conversationId === getActiveChatConversationId()
      ) {
        return;
      }

      showToast({
        ...getChatToastContent(notification),
        onClick: conversationId
          ? () => {
              router.push(`/chat?conversation=${conversationId}`);
            }
          : () => {
              router.push("/chat");
            },
      });
    });
  }, [router, showToast]);

  return null;
}
