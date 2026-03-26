import type { PaginatedAuditLogs } from '@/types/admin';
import {
  EmptyState,
  StatusBadge,
  TableSkeletonRows,
  formatDateTime,
  truncateId,
} from '@/features/admin/shared';

interface DashboardActivityTableProps {
  logs: PaginatedAuditLogs | null;
  loading: boolean;
}

export function DashboardActivityTable({ logs, loading }: DashboardActivityTableProps) {
  return (
    <section className="overflow-hidden rounded-none border border-[#c4c6cf] bg-[#f4f4f0] shadow-sm">
      <div className="border-b border-[#c4c6cf] px-6 py-4">
        <h2 className="font-serif text-xl font-bold text-[#002045]">近期后台活动</h2>
        <p className="mt-2 font-mono text-[10px] tracking-widest text-[#74777f]">
          最近 5 条管理员审计记录
        </p>
      </div>

      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#c4c6cf]">
                {['记录 ID', '操作人', '操作类型', '目标资源', '时间'].map((header) => (
                  <th key={header} className="px-5 py-4 font-mono text-[10px] tracking-widest text-[#002045]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableSkeletonRows rows={5} cols={5} />
            </tbody>
          </table>
        </div>
      ) : !logs || logs.logs.length === 0 ? (
        <div className="p-6">
          <EmptyState title="暂无后台活动" description="当前没有可展示的管理员审计记录。" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#c4c6cf]">
                {['记录 ID', '操作人', '操作类型', '目标资源', '时间'].map((header) => (
                  <th key={header} className="px-5 py-4 font-mono text-[10px] tracking-widest text-[#002045]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.logs.map((log) => (
                <tr key={log.id} className="border-b border-[#ddd8cf] last:border-b-0">
                  <td className="px-5 py-4 font-mono text-xs text-[#74777f]">{truncateId(log.id)}</td>
                  <td className="px-5 py-4 text-sm text-[#002045]">{log.admin_username ?? log.admin_id ?? '系统'}</td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      label={log.action}
                  className="border-[#c4c6cf] bg-[#f4f4f0] text-[#002045]"
                    />
                  </td>
                  <td className="px-5 py-4 text-sm text-[#74777f]">
                    {[log.target_type, log.target_id].filter(Boolean).join(' / ') || '—'}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[#74777f]">{formatDateTime(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
