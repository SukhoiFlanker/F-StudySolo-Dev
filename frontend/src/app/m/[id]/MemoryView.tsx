'use client';

import { useState, useCallback } from 'react';
import {
  Clock, Zap, Hash, Share2, Check, Copy,
  AlertTriangle, CheckCircle2, Loader2, XCircle,
  ChevronDown, ChevronUp, Timer,
} from 'lucide-react';
import type { WorkflowRunDetail, RunTrace } from '@/types/memory';
import { toggleRunShare } from '@/services/memory.service';
import { NODE_TYPE_META } from '@/features/workflow/constants/workflow-meta';
import type { NodeType } from '@/types/workflow';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(ms: number | null) {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function computeTotalDuration(run: WorkflowRunDetail): number | null {
  if (!run.started_at || !run.completed_at) return null;
  return new Date(run.completed_at).getTime() - new Date(run.started_at).getTime();
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; label: string; className: string }> = {
  completed: { icon: CheckCircle2, label: '已完成', className: 'text-emerald-600 dark:text-emerald-400' },
  failed: { icon: XCircle, label: '执行失败', className: 'text-rose-600 dark:text-rose-400' },
  running: { icon: Loader2, label: '执行中', className: 'text-sky-600 dark:text-sky-400' },
};

function getNodeMeta(nodeType: string) {
  const meta = NODE_TYPE_META[nodeType as NodeType];
  return meta ?? NODE_TYPE_META.chat_response;
}

// ─── Markdown-lite renderer (no external dep) ───────────────────────────────

function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-[12px] leading-relaxed font-mono">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="text-[13px] font-bold mt-3 mb-1 font-serif">{line.slice(4)}</h4>;
        if (line.startsWith('## ')) return <h3 key={i} className="text-[14px] font-bold mt-4 mb-1 font-serif">{line.slice(3)}</h3>;
        if (line.startsWith('# ')) return <h2 key={i} className="text-[15px] font-bold mt-4 mb-2 font-serif">{line.slice(2)}</h2>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        if (line.match(/^\d+\.\s/)) {
          const content = line.replace(/^\d+\.\s/, '');
          return <li key={i} className="ml-4 list-decimal">{content}</li>;
        }
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return <p key={i} className="my-0.5">{line}</p>;
      })}
    </div>
  );
}

// ─── TraceCard ──────────────────────────────────────────────────────────────

function TraceCard({ trace, index }: { trace: RunTrace; index: number }) {
  const [expanded, setExpanded] = useState(trace.status === 'done' && !!trace.final_output);
  const meta = getNodeMeta(trace.node_type);
  const Icon = meta.icon;
  const isError = trace.status === 'error';
  const isSkipped = trace.status === 'skipped';

  return (
    <div
      className={`group relative rounded-xl border bg-card shadow-sm transition-all hover:shadow-md ${
        isError
          ? 'border-rose-300 dark:border-rose-700/60'
          : isSkipped
            ? 'border-dashed border-muted-foreground/30'
            : 'border-border/60'
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        {/* Order badge */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-bold font-mono text-muted-foreground">
          {index + 1}
        </span>

        {/* Icon */}
        <span className={`shrink-0 ${isSkipped ? 'opacity-40' : ''}`}>
          <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        </span>

        {/* Name + type */}
        <div className="flex-1 min-w-0">
          <span className={`text-[13px] font-semibold font-serif ${isSkipped ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {trace.node_name}
          </span>
          <span className="ml-2 text-[10px] text-muted-foreground font-mono">
            {meta.label}
          </span>
        </div>

        {/* Meta badges */}
        <div className="flex items-center gap-2 shrink-0">
          {trace.model_route && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
              {trace.model_route}
            </span>
          )}
          {trace.duration_ms !== null && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-mono">
              <Timer className="h-3 w-3" />
              {formatDuration(trace.duration_ms)}
            </span>
          )}
          {isError && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border/40 px-4 py-3 space-y-3">
          {/* Input snapshot */}
          {trace.input_snapshot && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">📥 输入</p>
              <div className="rounded-lg bg-muted/50 p-3 text-[11px] text-muted-foreground max-h-32 overflow-y-auto scrollbar-hide">
                {trace.input_snapshot.length > 500 ? trace.input_snapshot.slice(0, 500) + '…' : trace.input_snapshot}
              </div>
            </div>
          )}

          {/* Output */}
          {trace.final_output && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">📤 输出</p>
              <div className="rounded-lg bg-muted/30 border border-border/30 p-3 max-h-[400px] overflow-y-auto scrollbar-hide">
                <SimpleMarkdown text={trace.final_output} />
              </div>
            </div>
          )}

          {/* Error */}
          {trace.error_message && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-3">
              <p className="text-[11px] text-rose-700 dark:text-rose-400 font-mono">{trace.error_message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ShareToggle ────────────────────────────────────────────────────────────

function ShareToggle({ runId, initialShared }: { runId: string; initialShared: boolean }) {
  const [isShared, setIsShared] = useState(initialShared);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggle = useCallback(async () => {
    setLoading(true);
    try {
      const result = await toggleRunShare(runId);
      if (result) setIsShared(result.is_shared);
    } finally {
      setLoading(false);
    }
  }, [runId]);

  const handleCopy = useCallback(() => {
    const url = `${window.location.origin}/m/${runId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [runId]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all border ${
          isShared
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
            : 'border-border text-muted-foreground hover:bg-muted'
        }`}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
        {isShared ? '已公开' : '分享'}
      </button>

      {isShared && (
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[10px] text-muted-foreground hover:bg-muted transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          {copied ? '已复制' : '复制链接'}
        </button>
      )}
    </div>
  );
}

// ─── Main MemoryView ────────────────────────────────────────────────────────

export default function MemoryView({ run }: { run: WorkflowRunDetail }) {
  const totalDuration = computeTotalDuration(run);
  const statusCfg = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.completed;
  const StatusIcon = statusCfg.icon;
  const doneTraces = run.traces.filter((t) => t.status === 'done');
  const errorTraces = run.traces.filter((t) => t.status === 'error');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* ── Run Summary Card ── */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h1 className="text-lg font-bold font-serif text-foreground truncate">
              {run.workflow_name}
            </h1>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDateTime(run.started_at)}
              </span>
              {totalDuration !== null && (
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  总耗时 {formatDuration(totalDuration)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Token {run.tokens_used?.toLocaleString() ?? '0'}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${statusCfg.className} border-current/20`}>
            <StatusIcon className={`h-3.5 w-3.5 ${run.status === 'running' ? 'animate-spin' : ''}`} />
            {statusCfg.label}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-2 border-t border-dashed border-border/40">
          <span className="text-[10px] text-muted-foreground">
            {doneTraces.length} 个节点完成
          </span>
          {errorTraces.length > 0 && (
            <span className="text-[10px] text-rose-600 dark:text-rose-400">
              {errorTraces.length} 个节点出错
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            共 {run.traces.length} 个节点
          </span>
          <div className="flex-1" />
          <ShareToggle runId={run.id} initialShared={run.is_shared} />
        </div>
      </div>

      {/* ── Input Summary ── */}
      {run.input && (
        <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">用户输入</p>
          <p className="text-[13px] text-foreground font-serif leading-relaxed">{run.input}</p>
        </div>
      )}

      {/* ── Section title ── */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-[11px] font-semibold text-muted-foreground font-serif tracking-wider">执行记录</span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      {/* ── Trace cards ── */}
      {run.traces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">该运行记录暂无详细节点数据</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">此运行可能发生在记忆系统启用之前</p>
        </div>
      ) : (
        <div className="space-y-3">
          {run.traces.map((trace, i) => (
            <TraceCard key={trace.id} trace={trace} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
