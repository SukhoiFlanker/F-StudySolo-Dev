'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, MoreHorizontal, History, ChevronDown, X, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '@/stores/use-workflow-store';
import { useWorkflowExecution } from '@/features/workflow/hooks/use-workflow-execution';
import { ModelSelector } from './ModelSelector';
import { ChatMessages } from './ChatMessages';
import { ChatInputBar } from './ChatInputBar';
import { useCanvasContext } from '@/features/workflow/hooks/use-canvas-context';
import { useActionExecutor, type CanvasAction } from '@/features/workflow/hooks/use-action-executor';
import { useConversationStore } from '@/features/workflow/hooks/use-conversation-store';
import { useStreamChat } from '@/features/workflow/hooks/use-stream-chat';
import { type AIModelOption, DEFAULT_MODEL } from '@/features/workflow/constants/ai-models';
import type { Edge, Node } from '@xyflow/react';

// ── Exported types (consumed by ChatInputBar & useStreamChat) ────

export type AIMode = 'plan' | 'chat' | 'create';
export type ThinkingDepth = 'fast' | 'balanced' | 'deep';

interface ChatEntry { id: string; role: 'user' | 'assistant'; content: string; timestamp: number; }
interface GenerateResponse { nodes: Node[]; edges: Edge[]; implicit_context: Record<string, unknown>; }

// ── Component ───────────────────────────────────────────────────────

export function SidebarAIPanel() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModelOption>(DEFAULT_MODEL);
  const [mode, setMode] = useState<AIMode>('chat');
  const [thinkingDepth, setThinkingDepth] = useState<ThinkingDepth>('balanced');

  const scrollRef = useRef<HTMLDivElement>(null);
  const historyDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const { replaceWorkflowGraph, setGenerationContext, lastPrompt, undo } = useWorkflowStore();
  const { start: startExecution } = useWorkflowExecution();
  const { serialize } = useCanvasContext();
  const { execute: executeActions } = useActionExecutor();
  const { conversations, createConversation, appendMessage, switchConversation, clearActive, deleteConversation } = useConversationStore();
  const { streaming, send: sendStream, abort: abortStream } = useStreamChat();

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [history]);
  useEffect(() => { function h(e: MouseEvent) { if (historyDropdownRef.current && !historyDropdownRef.current.contains(e.target as HTMLElement)) setShowHistoryDropdown(false); if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as HTMLElement)) setShowMoreMenu(false); } document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

  const pushMsg = useCallback((role: 'user' | 'assistant', content: string) => {
    const entry: ChatEntry = { id: crypto.randomUUID(), role, content, timestamp: Date.now() };
    setHistory((p) => [...p, entry]); appendMessage(entry);
  }, [appendMessage]);

  // ── Quick ACTION ──────────────────────────────────────────────

  const handleQuickAction = useCallback((u: string): boolean => {
    if (/^(运行|执行|开始|跑一下)/.test(u)) { startExecution(); pushMsg('assistant', '▶ 已开始运行工作流。'); return true; }
    if (/^(撤销|undo)/.test(u)) { undo(); pushMsg('assistant', '↩ 已撤销。'); return true; }
    return false;
  }, [startExecution, undo, pushMsg]);

  // ── Core send ─────────────────────────────────────────────────

  // Track which message is currently streaming for cursor display
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const handleSend = async () => {
    if ((!input.trim() && !streaming) || loading) return;
    if (streaming) { abortStream(); setStreamingMessageId(null); return; }
    const userInput = input.trim(); if (!userInput) return;
    pushMsg('user', userInput); setInput(''); setError(null);
    if (handleQuickAction(userInput)) return;

    setLoading(true);
    const ctx = serialize();
    const sid = crypto.randomUUID();
    setStreamingMessageId(sid);
    setHistory((p) => [...p, { id: sid, role: 'assistant', content: '', timestamp: Date.now() }]);
    
    // 如果是 create，不传 intentHint 让他自己跑分类器 (如果不明确是 ACTION)
    const intentHint = mode === 'chat' ? 'CHAT' : undefined;

    await sendStream({ userInput, canvasContext: ctx, history, intentHint, mode, selectedModel, thinkingDepth,
      onToken: (t) => { setLoading(false); setHistory((p) => p.map((m) => m.id === sid ? { ...m, content: m.content + t } : m)); },
      onDone: async (fullText, ri) => {
        if (ri === 'MODIFY') { 
          try { 
            const p = JSON.parse(fullText) as { actions?: CanvasAction[]; response?: string }; 
            let a = p.actions ?? []; 
            if (a.some((x) => x.operation === 'DELETE_NODE') && !window.confirm('AI 建议删除节点，确认？（可撤销）')) { 
              a = a.filter((x) => x.operation !== 'DELETE_NODE'); 
              if (!a.length) { 
                setHistory((h) => h.map((m) => m.id === sid ? { ...m, content: '⏸️ 已取消。' } : m)); 
                return; 
              } 
            } 
            const r = await executeActions(a); 
            setHistory((h) => h.map((m) => m.id === sid ? { ...m, content: r.success ? `✅ ${p.response || '完成'} (${r.appliedCount}步)` : `⚠️ ${r.error}` } : m)); 
          } catch { 
            setHistory((h) => h.map((m) => m.id === sid ? { ...m, content: fullText } : m)); 
          } 
        }
        else if (ri === 'BUILD') { 
          replaceWorkflowGraph([{ id: 'generating-node', position: { x: 300, y: 200 }, type: 'generating', data: {} }], []); 
          try { 
            const r = await fetch('/api/ai/generate-workflow', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_input: userInput, thinking_level: thinkingDepth }) }); 
            const d: GenerateResponse = await r.json(); 
            replaceWorkflowGraph(d.nodes, d.edges); 
            setGenerationContext(userInput, d.implicit_context); 
            setHistory((h) => h.map((m) => m.id === sid ? { ...m, content: `✅ 已生成 ${d.nodes.length} 个节点。` } : m)); 
          } catch (e: unknown) { 
            setHistory((h) => h.map((m) => m.id === sid ? { ...m, content: `❌ ${e instanceof Error ? e.message : '失败'}` } : m)); 
          }
        }
        else if (ri === 'PLAN') {
          // PLAN 模式下，AI 返回了 xml，将其保存到消息记录，组件会负责渲染为 PlanCard
          // 这里不做任何修改
        }
        
        setStreamingMessageId(null);
        appendMessage({ id: sid, role: 'assistant', content: fullText, timestamp: Date.now() });
      },
      onError: (err) => { setError(err); setLoading(false); setStreamingMessageId(null); setHistory((p) => p.map((m) => m.id === sid ? { ...m, content: `❌ ${err}` } : m)); },
    });
    setLoading(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* ═══ TOP BAR ═══ */}
      <div className="shrink-0 flex items-center justify-between px-3 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground font-serif">AI 对话</span>
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
        </div>
        <div className="flex items-center gap-1">
          <div className="relative" ref={historyDropdownRef}>
            <button type="button" onClick={() => setShowHistoryDropdown(!showHistoryDropdown)} className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground" title="对话记录">
              <History className="h-3 w-3" /><ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 opacity-70 ${showHistoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showHistoryDropdown && (
              <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border-[1.5px] border-border/50 node-paper-bg p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 font-serif">最近对话</div>
                {conversations.length === 0 ? <p className="px-2 py-3 text-center text-xs text-muted-foreground/50">暂无记录</p> : (
                  <div className="max-h-56 overflow-y-auto scrollbar-hide">{[...conversations].reverse().map((c) => (
                    <div key={c.id} role="button" tabIndex={0} onClick={() => { setHistory(c.messages); switchConversation(c.id); setShowHistoryDropdown(false); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setHistory(c.messages); switchConversation(c.id); setShowHistoryDropdown(false); } }} className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all hover:bg-white/5 cursor-pointer">
                      <div className="min-w-0 flex-1"><span className="text-[11px] font-medium text-foreground/90 truncate block">{c.title}</span><span className="text-[10px] text-muted-foreground/50 truncate block">{c.preview}</span></div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-destructive transition-opacity"><X className="h-3 w-3" /></button>
                    </div>
                  ))}</div>
                )}
              </div>
            )}
          </div>
          <div className="h-3 w-px bg-border/50 mx-0.5" />
          <button type="button" onClick={() => { setHistory([]); setError(null); setInput(''); createConversation(); }} className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground" title="新建对话"><Plus className="h-3.5 w-3.5" /></button>
          <div className="relative" ref={moreMenuRef}>
            <button type="button" onClick={() => setShowMoreMenu(!showMoreMenu)} className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground" title="更多"><MoreHorizontal className="h-3.5 w-3.5" /></button>
            {showMoreMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl border-[1.5px] border-border/50 node-paper-bg p-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                <button type="button" onClick={() => { setHistory([]); clearActive(); setError(null); setShowMoreMenu(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] text-muted-foreground transition-all hover:bg-white/5 hover:text-destructive"><Trash2 className="h-3 w-3" />清空对话</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MESSAGES ═══ */}
      <ChatMessages history={history} loading={loading} streaming={streaming} streamingMessageId={streamingMessageId} lastPrompt={lastPrompt} scrollRef={scrollRef} />

      {/* ═══ INPUT ═══ */}
      <ChatInputBar input={input} setInput={setInput} mode={mode} setMode={setMode} thinkingDepth={thinkingDepth} setThinkingDepth={setThinkingDepth} loading={loading} streaming={streaming} error={error} setError={setError} onSend={() => void handleSend()} />
    </div>
  );
}
