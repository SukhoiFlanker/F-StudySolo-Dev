'use client';

/**
 * AI 对话持久化 — 基于 localStorage.
 *
 * 每次对话保存到 'studysolo:ai-conversations' key。
 * 支持多会话管理、标题自动提取、会话切换。
 * 单文件 < 300 行。
 */

import { useState, useCallback, useEffect } from 'react';

// ── Types ────────────────────────────────────────────────────────────

export interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ConversationRecord {
  id: string;
  title: string;
  preview: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatEntry[];
}

const STORAGE_KEY = 'studysolo:ai-conversations';
const MAX_CONVERSATIONS = 20;
const MAX_MESSAGES_PER_CONV = 100;

// ── Storage helpers ───────────────────────────────────────────────

function loadAll(): ConversationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConversationRecord[]) : [];
  } catch {
    return [];
  }
}

function saveAll(records: ConversationRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // quota exceeded — trim oldest and retry
    const trimmed = records.slice(-10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}

function extractTitle(firstUserMessage: string): string {
  return firstUserMessage.slice(0, 24) + (firstUserMessage.length > 24 ? '...' : '');
}

// ── Hook ─────────────────────────────────────────────────────────

export function useConversationStore() {
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 初始化: 加载本地数据
  useEffect(() => {
    const stored = loadAll();
    setConversations(stored);
    // 默认激活最近一条
    if (stored.length > 0) {
      setActiveId(stored[stored.length - 1].id);
    }
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  /** 创建新会话 */
  const createConversation = useCallback((): string => {
    const newId = `conv-${Date.now().toString(36)}`;
    const newRecord: ConversationRecord = {
      id: newId,
      title: '新对话',
      preview: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => {
      const updated = [...prev, newRecord].slice(-MAX_CONVERSATIONS);
      saveAll(updated);
      return updated;
    });
    setActiveId(newId);
    return newId;
  }, []);

  /** 向当前会话追加一条消息 */
  const appendMessage = useCallback(
    (entry: ChatEntry) => {
      if (!activeId) return;
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id !== activeId) return conv;

          const isFirst = conv.messages.length === 0 && entry.role === 'user';
          const newMessages = [...conv.messages, entry].slice(-MAX_MESSAGES_PER_CONV);

          return {
            ...conv,
            title: isFirst ? extractTitle(entry.content) : conv.title,
            preview: entry.content.slice(0, 48),
            updatedAt: Date.now(),
            messages: newMessages,
          };
        });
        saveAll(updated);
        return updated;
      });
    },
    [activeId],
  );

  /** 切换到指定会话 */
  const switchConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  /** 清空当前会话消息 (保留会话记录) */
  const clearActive = useCallback(() => {
    if (!activeId) return;
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeId ? { ...c, messages: [], preview: '', updatedAt: Date.now() } : c,
      );
      saveAll(updated);
      return updated;
    });
  }, [activeId]);

  /** 删除指定会话 */
  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        saveAll(updated);
        return updated;
      });
      if (activeId === id) {
        setActiveId(null);
      }
    },
    [activeId],
  );

  return {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    appendMessage,
    switchConversation,
    clearActive,
    deleteConversation,
  };
}
