import type { AuditLogItem } from '@/types/admin';
import { EmptyState, formatDateTime } from '@/features/admin/shared';

interface AuditDetailPaneProps {
  log: AuditLogItem | null;
}

export function AuditDetailPane({ log }: AuditDetailPaneProps) {
  if (!log) {
    return (
      <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <EmptyState title="请选择日志" description="点击左侧表格中的审计记录后，可查看完整详情。" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 h-fit sticky top-8">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <span className="material-symbols-outlined text-[20px] text-slate-400">info</span>
        <h2 className="text-base font-bold text-slate-900">日志详情</h2>
      </div>
      
      <div className="space-y-5">
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            操作类型
          </p>
          <p className="mt-1.5 text-sm font-medium text-slate-900">{log.action}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              操作人
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-900 flex items-center gap-1.5">
              {log.admin_username ?? log.admin_id ?? '系统'}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              目标资源
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">
              <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                {[log.target_type, log.target_id].filter(Boolean).join(' / ') || '—'}
              </code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              来源 IP
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{log.ip_address ?? '—'}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              发生时间
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{formatDateTime(log.created_at)}</p>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            User Agent
          </p>
          <p className="mt-1.5 text-xs leading-relaxed break-all text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {log.user_agent ?? '—'}
          </p>
        </div>
        
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            <span className="material-symbols-outlined text-[14px]">data_object</span>
            详细数据
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
            {JSON.stringify(log.details ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
