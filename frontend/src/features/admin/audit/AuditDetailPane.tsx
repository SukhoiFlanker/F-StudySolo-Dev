import type { AuditLogItem } from '@/types/admin';
import { EmptyState, formatDateTime } from '@/features/admin/shared';

interface AuditDetailPaneProps {
  log: AuditLogItem | null;
}

export function AuditDetailPane({ log }: AuditDetailPaneProps) {
  if (!log) {
    return (
      <div className="h-full rounded-md border border-border bg-card p-6">
        <EmptyState title="请选择日志" description="点击左侧表格中的审计记录后，可查看完整详情。" />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-6 h-fit sticky top-8">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
        <span className="material-symbols-outlined text-[20px] text-muted-foreground/60">info</span>
        <h2 className="text-[14px] font-semibold text-foreground">日志详情</h2>
      </div>
      
      <div className="space-y-5">
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">
            操作类型
          </p>
          <p className="mt-1.5 text-[13px] font-medium text-foreground">{log.action}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">
              操作人
            </p>
            <p className="mt-1.5 text-[13px] font-medium text-foreground flex items-center gap-1.5">
              {log.admin_username ?? log.admin_id ?? '系统'}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">
              目标资源
            </p>
            <p className="mt-1.5 text-[13px] font-medium text-foreground">
              <code className="rounded bg-secondary px-2 py-0.5 font-mono text-[12px] text-muted-foreground">
                {[log.target_type, log.target_id].filter(Boolean).join(' / ') || '—'}
              </code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">
              来源 IP
            </p>
            <p className="mt-1.5 text-[13px] font-medium text-foreground">{log.ip_address ?? '—'}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">
              发生时间
            </p>
            <p className="mt-1.5 text-[13px] font-medium text-foreground">{formatDateTime(log.created_at)}</p>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">
            User Agent
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed break-all text-muted-foreground bg-secondary p-3 rounded-md border border-border">
            {log.user_agent ?? '—'}
          </p>
        </div>
        
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">
            <span className="material-symbols-outlined text-[14px]">data_object</span>
            详细数据
          </p>
          <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-secondary p-4 font-mono text-[12px] leading-relaxed text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            {JSON.stringify(log.details ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
