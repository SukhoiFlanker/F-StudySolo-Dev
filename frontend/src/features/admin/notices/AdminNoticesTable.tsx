import { useRouter } from 'next/navigation';
import type { PaginatedNoticeList } from '@/types/admin';
import {
  NOTICE_STATUS_BADGE,
  NOTICE_TYPE_BADGE,
  Pagination,
  StatusBadge,
  TableSkeletonRows,
  formatDate,
  resolveBadgeStyle,
} from '@/features/admin/shared';

interface AdminNoticesTableProps {
  data: PaginatedNoticeList | null;
  loading: boolean;
  page: number;
  actionLoading: string | null;
  onPageChange: (page: number) => void;
  onPublish: (noticeId: string) => void;
  onDelete: (noticeId: string, title: string) => void;
}

export function AdminNoticesTable({
  data,
  loading,
  page,
  actionLoading,
  onPageChange,
  onPublish,
  onDelete,
}: AdminNoticesTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">标题</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">类型</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">状态</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">创建时间</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">发布时间</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <TableSkeletonRows rows={8} cols={6} />
            ) : !data || data.notices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  暂无公告
                </td>
              </tr>
            ) : (
              data.notices.map((notice) => {
                const typeBadge = resolveBadgeStyle(NOTICE_TYPE_BADGE, notice.type, notice.type);
                const statusBadge = resolveBadgeStyle(NOTICE_STATUS_BADGE, notice.status, notice.status);

                return (
                  <tr
                    key={notice.id}
                    onClick={() => router.push(`/admin-analysis/notices/${notice.id}/edit`)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50/50"
                  >
                    <td className="max-w-xs px-6 py-4 text-sm font-medium text-slate-900">
                      <span className="line-clamp-1">{notice.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge label={typeBadge.label} className={typeBadge.className} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge label={statusBadge.label} className={statusBadge.className} />
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{formatDate(notice.created_at)}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{formatDate(notice.published_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        {notice.status === 'draft' ? (
                          <>
                            <button
                              onClick={() => onPublish(notice.id)}
                              disabled={actionLoading === notice.id}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {actionLoading === notice.id ? '...' : '发布'}
                            </button>
                            <button
                              onClick={() => onDelete(notice.id, notice.title)}
                              disabled={actionLoading === notice.id}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              删除
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => router.push(`/admin-analysis/notices/${notice.id}/edit`)}
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
                          >
                            编辑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 p-2">
        <Pagination
          page={page}
          totalPages={data?.total_pages ?? 1}
          total={data?.total}
          loading={loading}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
