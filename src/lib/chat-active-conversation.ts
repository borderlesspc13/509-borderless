let activeConversationId: string | null = null;

export function setActiveChatConversationId(conversationId: string | null) {
  activeConversationId = conversationId;
}

export function getActiveChatConversationId() {
  return activeConversationId;
}
