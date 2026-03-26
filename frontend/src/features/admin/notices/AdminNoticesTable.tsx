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
    <div className="overflow-hidden rounded-none border border-[#c4c6cf] bg-[#f4f4f0] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#c4c6cf]">
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[#002045]">标题</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[#002045]">类型</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[#002045]">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[#002045]">创建时间</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[#002045]">发布时间</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[#002045]">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonRows rows={8} cols={6} />
            ) : !data || data.notices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#74777f]">
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
                    className="group cursor-pointer border-b border-[#ddd8cf] transition-colors hover:bg-[#ebe9df]"
                  >
                    <td className="max-w-xs px-4 py-3 text-[#002045] transition-colors">
                      <span className="line-clamp-1">{notice.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={typeBadge.label} className={typeBadge.className} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={statusBadge.label} className={statusBadge.className} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#74777f]">{formatDate(notice.created_at)}</td>
                    <td className="px-4 py-3 text-xs text-[#74777f]">{formatDate(notice.published_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        {notice.status === 'draft' ? (
                          <>
                            <button
                              onClick={() => onPublish(notice.id)}
                              disabled={actionLoading === notice.id}
                              className="rounded-none border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {actionLoading === notice.id ? '...' : '发布'}
                            </button>
                            <button
                              onClick={() => onDelete(notice.id, notice.title)}
                              disabled={actionLoading === notice.id}
                              className="rounded-none border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              删除
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => router.push(`/admin-analysis/notices/${notice.id}/edit`)}
                            className="text-xs font-medium text-[#002045] transition-colors hover:underline"
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

      <Pagination
        page={page}
        totalPages={data?.total_pages ?? 1}
        total={data?.total}
        loading={loading}
        onPageChange={onPageChange}
      />
    </div>
  );
}
