'use client';

/**
 * ThinkingCard — Collapsible card showing AI reasoning process.
 *
 * Renders <think> content from DeepSeek R1 in a scholarly-styled
 * expandable panel with Route icon and streaming indicator.
 */

import { useState, memo } from 'react';
import { ChevronDown, Route } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ThinkingCardProps {
  /** Raw thinking content (chain-of-thought) */
  thinking: string;
  /** Whether the model is still producing thinking tokens */
  isStreaming?: boolean;
}

export const ThinkingCard = memo(function ThinkingCard({
  thinking,
  isStreaming,
}: ThinkingCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!thinking) return null;

  return (
    <div className="mb-2.5 rounded-lg border-[1.5px] border-border/30 bg-muted/10 overflow-hidden transition-all">
      {/* Header — clickable to toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/20"
      >
        <Route className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-[10px] font-medium tracking-wider text-muted-foreground/70 font-sans uppercase">
          {isStreaming ? 'Thinking...' : 'Thought Process'}
        </span>
        {isStreaming && (
          <span className="flex gap-[3px] ml-1">
            <span className="h-1 w-1 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
            <span className="h-1 w-1 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
            <span className="h-1 w-1 rounded-full bg-primary/30 animate-bounce [animation-delay:300ms]" />
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 ml-auto text-muted-foreground/40 transition-transform duration-200 ${
            collapsed ? '-rotate-90' : ''
          }`}
        />
      </button>

      {/* Body — collapsible */}
      {!collapsed && (
        <div className="px-3 pb-2.5 text-[11px] leading-relaxed text-muted-foreground/60 max-h-52 overflow-y-auto scrollbar-hide">
          <div className="prose-chat [&_p]:text-[11px] [&_p]:leading-relaxed [&_p]:text-muted-foreground/60 [&_li]:text-[11px]">
            <ReactMarkdown>{thinking}</ReactMarkdown>
          </div>
          {isStreaming && (
            <span className="inline-block h-3 w-[2px] ml-0.5 animate-pulse bg-muted-foreground/30 rounded-full translate-y-[2px]" />
          )}
        </div>
      )}
    </div>
  );
});
