import { beforeEach, describe, expect, it } from 'vitest';
import { persistConversationMessage } from '@/features/workflow/hooks/chat-conversation-sync';
import { useConversationStore } from '@/stores/chat/use-conversation-store';

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

describe('chat conversation sync bridge', () => {
  const localStorage = createLocalStorageMock();

  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorage,
      configurable: true,
      writable: true,
    });

    localStorage.clear();
    useConversationStore.setState({
      conversations: [],
      activeId: null,
      activeConversation: null,
    });
  });

  it('creates a conversation before appending when no active conversation exists', () => {
    const conversationId = persistConversationMessage({
      id: 'msg-1',
      role: 'assistant',
      content: '这是一次自动补写的回复',
      timestamp: 1,
    });

    const state = useConversationStore.getState();

    expect(conversationId).toBeTruthy();
    expect(state.activeId).toBe(conversationId);
    expect(state.activeConversation?.messages).toEqual([
      {
        id: 'msg-1',
        role: 'assistant',
        content: '这是一次自动补写的回复',
        timestamp: 1,
      },
    ]);
  });

  it('reuses the active conversation for subsequent appended messages', () => {
    const firstConversationId = persistConversationMessage({
      id: 'msg-user',
      role: 'user',
      content: '先建一个会话',
      timestamp: 1,
    });

    const secondConversationId = persistConversationMessage({
      id: 'msg-assistant',
      role: 'assistant',
      content: '继续写入同一个会话',
      timestamp: 2,
    });

    const state = useConversationStore.getState();

    expect(secondConversationId).toBe(firstConversationId);
    expect(state.conversations).toHaveLength(1);
    expect(state.activeConversation?.messages.map((message) => message.id)).toEqual([
      'msg-user',
      'msg-assistant',
    ]);
  });
});
