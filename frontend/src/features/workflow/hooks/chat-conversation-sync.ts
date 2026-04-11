import type { ChatEntry } from '@/stores/chat/use-conversation-store';
import { useConversationStore } from '@/stores/chat/use-conversation-store';

export function ensureConversationReady(): string {
  const store = useConversationStore.getState();
  if (store.activeId) {
    return store.activeId;
  }
  return store.createConversation();
}


export function persistConversationMessage(entry: ChatEntry): string {
  const conversationId = ensureConversationReady();
  useConversationStore.getState().appendMessage(entry);
  return conversationId;
}
