'use client';

import { History, Sparkles } from 'lucide-react';

interface HistoryEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatMessagesProps {
  history: HistoryEntry[];
  loading: boolean;
  lastPrompt: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * AI 对话的消息列表区域.
 *
 * 包含空状态展示和消息气泡渲染。
 */
export function ChatMessages({ history, loading, lastPrompt, scrollRef }: ChatMessagesProps) {
  if (history.length === 0) {
    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="relative mb-5">
            <div className="node-paper-bg flex h-12 w-12 items-center justify-center rounded-xl border-[1.5px] border-border/50 shadow-sm">
              <Sparkles className="h-5 w-5 text-primary stroke-[1.5]" />
            </div>
          </div>
          <h3 className="text-[13px] font-bold text-foreground/90 font-serif">准备就绪</h3>
          <p className="mt-1.5 max-w-[200px] text-[11px] leading-relaxed text-muted-foreground/80 font-serif">
            描述你的学习目标，我将为你构建工作流。
            <br />也可以对话讨论或修改已有节点。
          </p>
          {lastPrompt ? (
            <div className="mt-4 flex items-center gap-1.5 rounded-lg border-[1.5px] border-border/50 node-paper-bg px-2.5 py-1.5 shadow-sm">
              <History className="h-3 w-3 text-muted-foreground stroke-[1.5]" />
              <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px]">
                {lastPrompt.slice(0, 40)}
                {lastPrompt.length > 40 ? '...' : ''}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="space-y-4 p-4">
        {history.map((entry) => (
          <div
            key={entry.id}
            className={`group relative max-w-[92%] ${entry.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
          >
            <div
              className={`node-paper-bg rounded-xl border-[1.5px] px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm font-serif ${
                entry.role === 'user'
                  ? 'border-primary/30 text-foreground/90'
                  : 'border-border/50 text-foreground/90'
              }`}
            >
              {entry.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-xl border-[1.5px] border-border/50 node-paper-bg shadow-sm px-3.5 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
