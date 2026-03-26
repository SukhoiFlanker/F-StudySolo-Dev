import type { AuditLogItem } from '@/types/admin';
import { EmptyState, formatDateTime } from '@/features/admin/shared';

interface AuditDetailPaneProps {
  log: AuditLogItem | null;
}

export function AuditDetailPane({ log }: AuditDetailPaneProps) {
  if (!log) {
    return <EmptyState title="请选择日志" description="点击左侧表格中的审计记录后，可查看完整详情。" />;
  }

  return (
    <div className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-5 shadow-sm">
      <h2 className="font-serif text-xl font-bold text-[#002045]">日志详情</h2>
      <div className="mt-5 space-y-4 text-sm">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">操作类型</p>
          <p className="mt-1 text-[#002045]">{log.action}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">操作人</p>
          <p className="mt-1 text-[#002045]">{log.admin_username ?? log.admin_id ?? '系统'}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">目标资源</p>
          <p className="mt-1 text-[#002045]">{[log.target_type, log.target_id].filter(Boolean).join(' / ') || '—'}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">来源 IP</p>
          <p className="mt-1 text-[#002045]">{log.ip_address ?? '—'}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">User Agent</p>
          <p className="mt-1 break-all text-[#002045]">{log.user_agent ?? '—'}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">发生时间</p>
          <p className="mt-1 text-[#002045]">{formatDateTime(log.created_at)}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">详细数据</p>
        <pre className="mt-2 overflow-x-auto rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-3 font-mono text-xs text-[#002045] shadow-sm">
            {JSON.stringify(log.details ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
