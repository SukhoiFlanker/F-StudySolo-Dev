'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Plus, MoreHorizontal, History, ChevronDown, X, Trash2, ArrowRight, Square } from 'lucide-react';
import { useWorkflowStore } from '@/stores/use-workflow-store';
import { useWorkflowExecution } from '@/features/workflow/hooks/use-workflow-execution';
import { ModelSelector } from './ModelSelector';
import { ChatMessages } from './ChatMessages';
import { useCanvasContext } from '@/features/workflow/hooks/use-canvas-context';
import { useActionExecutor, type CanvasAction } from '@/features/workflow/hooks/use-action-executor';
import { useConversationStore } from '@/features/workflow/hooks/use-conversation-store';
import { useStreamChat } from '@/features/workflow/hooks/use-stream-chat';
import { classifyIntent } from '@/features/workflow/utils/intent-classifier';
import { type AIModelOption, DEFAULT_MODEL } from '@/features/workflow/constants/ai-models';
import type { Edge, Node } from '@xyflow/react';

// ── Types ───────────────────────────────────────────────────────────

interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface GenerateResponse {
  nodes: Node[];
  edges: Edge[];
  implicit_context: Record<string, unknown>;
}

interface AIChatResponse {
  intent: string;
  response: string;
  actions?: CanvasAction[];
}

// ── Component ───────────────────────────────────────────────────────

export function SidebarAIPanel() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModelOption>(DEFAULT_MODEL);

  const scrollRef = useRef<HTMLDivElement>(null);
  const historyDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { replaceWorkflowGraph, setGenerationContext, lastPrompt, undo } = useWorkflowStore();
  const { start: startExecution } = useWorkflowExecution();
  const { serialize } = useCanvasContext();
  const { execute: executeActions } = useActionExecutor();
  const { conversations, createConversation, appendMessage, switchConversation, clearActive, deleteConversation } = useConversationStore();
  const { streaming, send: sendStream, abort: abortStream } = useStreamChat();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, streamingContent]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(e.target as HTMLElement)) setShowHistoryDropdown(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as HTMLElement)) setShowMoreMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pushMsg = useCallback((role: 'user' | 'assistant', content: string) => {
    const entry: ChatEntry = { id: crypto.randomUUID(), role, content, timestamp: Date.now() };
    setHistory((p) => [...p, entry]);
    appendMessage(entry);
  }, [appendMessage]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  // ── ACTION 意图执行 ─────────────────────────────────────────

  const handleAction = useCallback((userInput: string) => {
    const lower = userInput.toLowerCase();
    if (/运行|执行|跑一下/.test(lower)) {
      startExecution();
      pushMsg('assistant', '▶ 已开始运行工作流，请在右侧面板查看进度。');
    } else if (/撤销|undo/.test(lower)) {
      undo();
      pushMsg('assistant', '↩ 已撤销上一步操作。');
    } else {
      pushMsg('assistant', '⚡ 操作已执行。');
    }
  }, [startExecution, undo, pushMsg]);

  // ── 核心: 统一发送 ─────────────────────────────────────────

  const handleSend = async () => {
    if ((!input.trim() && !streaming) || loading) return;

    // 中止流式
    if (streaming) { abortStream(); return; }

    const userInput = input.trim();
    if (!userInput) return;

    pushMsg('user', userInput);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);
    setError(null);

    const ctx = serialize();
    const { intent, confidence } = classifyIntent(userInput, ctx);

    // ── ACTION (高置信): 直接执行 ──
    if (intent === 'ACTION' && confidence > 0.8) {
      handleAction(userInput);
      setLoading(false);
      return;
    }

    // ── BUILD (高置信): generate-workflow 管线 ──
    if (intent === 'BUILD' && confidence > 0.7) {
      replaceWorkflowGraph([{ id: 'generating-node', position: { x: 300, y: 200 }, type: 'generating', data: {} }], []);
      try {
        const res = await fetch('/api/ai/generate-workflow', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_input: userInput }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? `HTTP ${res.status}`);
        const data: GenerateResponse = await res.json();
        replaceWorkflowGraph(data.nodes, data.edges);
        setGenerationContext(userInput, data.implicit_context);
        pushMsg('assistant', `✅ 已生成 ${data.nodes.length} 个工作流节点，可继续对话修改。`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '生成失败';
        setError(msg); pushMsg('assistant', `❌ ${msg}`);
      } finally { setLoading(false); }
      return;
    }

    // ── MODIFY / CHAT (低置信度): 使用流式 API ──
    setLoading(false);
    const streamAssistantId = crypto.randomUUID();
    setHistory((p) => [...p, { id: streamAssistantId, role: 'assistant', content: '', timestamp: Date.now() }]);

    await sendStream({
      userInput,
      canvasContext: ctx,
      history,
      intentHint: confidence > 0.8 ? intent : null,
      selectedModel,
      onToken: (token) => {
        setHistory((p) => p.map((m) => m.id === streamAssistantId
          ? { ...m, content: m.content + token } : m,
        ));
      },
      onDone: async (fullText, responseIntent) => {
        if (responseIntent === 'MODIFY') {
          try {
            const parsed = JSON.parse(fullText) as { actions?: CanvasAction[]; response?: string };
            let actions = parsed.actions ?? [];

            // 破坏性操作确认 (Human-in-the-loop)
            const hasDelete = actions.some((a) => a.operation === 'DELETE_NODE');
            if (hasDelete) {
              const confirmed = window.confirm('AI 建议删除节点，确认执行此操作？（可撤销）');
              if (!confirmed) {
                actions = actions.filter((a) => a.operation !== 'DELETE_NODE');
                if (!actions.length) {
                  setHistory((p) => p.map((m) => m.id === streamAssistantId ? { ...m, content: '⏸️ 已取消删除操作。' } : m));
                  return;
                }
              }
            }

            const result = await executeActions(actions);
            const msg = result.success
              ? `✅ ${parsed.response || '修改完成'} (执行了 ${result.appliedCount} 步操作)`
              : `⚠️ ${result.error ?? '操作部分失败'}`;
            setHistory((p) => p.map((m) => m.id === streamAssistantId ? { ...m, content: msg } : m));
          } catch {
            setHistory((p) => p.map((m) => m.id === streamAssistantId ? { ...m, content: fullText } : m));
          }
        } else if (responseIntent === 'BUILD') {
          replaceWorkflowGraph([{ id: 'generating-node', position: { x: 300, y: 200 }, type: 'generating', data: {} }], []);
          fetch('/api/ai/generate-workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_input: userInput }) })
            .then((r) => r.json() as Promise<GenerateResponse>)
            .then((d) => { replaceWorkflowGraph(d.nodes, d.edges); setGenerationContext(userInput, d.implicit_context); setHistory((p) => p.map((m) => m.id === streamAssistantId ? { ...m, content: `✅ 已生成 ${d.nodes.length} 个节点。` } : m)); })
            .catch((e: Error) => setHistory((p) => p.map((m) => m.id === streamAssistantId ? { ...m, content: `❌ ${e.message}` } : m)));
        }
        appendMessage({ id: streamAssistantId, role: 'assistant', content: fullText, timestamp: Date.now() });
      },
      onError: (err) => {
        setError(err);
        setHistory((p) => p.map((m) => m.id === streamAssistantId ? { ...m, content: `❌ ${err}` } : m));
      },
    });
  };

  const handleNewConversation = useCallback(() => {
    setHistory([]);
    setError(null);
    setInput('');
    createConversation();
  }, [createConversation]);

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
              <History className="h-3 w-3" />
              <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 opacity-70 ${showHistoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showHistoryDropdown && (
              <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border-[1.5px] border-border/50 node-paper-bg p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 font-serif">最近对话</div>
                {conversations.length === 0 ? (
                  <p className="px-2 py-3 text-center text-xs text-muted-foreground/50">暂无记录</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto scrollbar-hide">
                    {[...conversations].reverse().map((conv) => (
                      <button key={conv.id} type="button" onClick={() => { setHistory(conv.messages); switchConversation(conv.id); setShowHistoryDropdown(false); }} className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all hover:bg-white/5">
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-medium text-foreground/90 truncate block">{conv.title}</span>
                          <span className="text-[10px] text-muted-foreground/50 truncate block">{conv.preview}</span>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-destructive transition-opacity"><X className="h-3 w-3" /></button>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="h-3 w-px bg-border/50 mx-0.5" />
          <button type="button" onClick={handleNewConversation} className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground" title="新建对话"><Plus className="h-3.5 w-3.5" /></button>
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
      <ChatMessages history={history} loading={loading} lastPrompt={lastPrompt} scrollRef={scrollRef} />

      {/* ═══ INPUT ═══ */}
      <div className="shrink-0 p-3 pt-1">
        {error && !loading ? (
          <div className="mb-2 flex items-center justify-between px-2 py-1 rounded-md bg-destructive/10">
            <p className="text-[11px] text-destructive/80 truncate flex-1">{error}</p>
            <button type="button" onClick={() => setError(null)} className="ml-2 text-destructive/50 hover:text-destructive"><X className="h-3 w-3" /></button>
          </div>
        ) : null}
        <div className="node-paper-bg flex flex-col rounded-xl border-[1.5px] border-border/50 shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all">
          <textarea ref={textareaRef} className="min-h-[40px] max-h-[120px] w-full resize-none bg-transparent px-3.5 py-3 text-[13px] text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none font-serif" placeholder="描述学习目标、修改节点或对话..." value={input} onChange={handleTextareaChange} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handleSend(); }} disabled={loading} rows={1} />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${streaming ? 'text-primary bg-primary/10' : 'text-muted-foreground/40'}`}>{streaming ? '● 流式' : '○ 就绪'}</span>
            </div>
            <button
              onClick={() => void handleSend()}
              disabled={loading && !streaming}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border-[1.5px] shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 ${streaming ? 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20' : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:-translate-y-0.5'}`}
              title={streaming ? '停止生成' : '发送'}
            >
              {loading && !streaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : streaming ? <Square className="h-3 w-3 fill-current" /> : <ArrowRight className="h-4 w-4" strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
