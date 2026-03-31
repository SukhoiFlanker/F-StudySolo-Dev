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
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-6 py-4 text-left text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">标题</th>
              <th className="px-6 py-4 text-left text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">类型</th>
              <th className="px-6 py-4 text-left text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">状态</th>
              <th className="px-6 py-4 text-left text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">创建时间</th>
              <th className="px-6 py-4 text-left text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">发布时间</th>
              <th className="px-6 py-4 text-left text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {loading ? (
              <TableSkeletonRows rows={8} cols={6} />
            ) : !data || data.notices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[13px] text-muted-foreground">
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
                    className="group cursor-pointer transition-colors hover:bg-muted"
                  >
                    <td className="max-w-xs px-6 py-4 text-[13px] font-medium text-foreground">
                      <span className="line-clamp-1">{notice.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge label={typeBadge.label} className={typeBadge.className} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge label={statusBadge.label} className={statusBadge.className} />
                    </td>
                    <td className="px-6 py-4 text-[12px] font-medium text-muted-foreground">{formatDate(notice.created_at)}</td>
                    <td className="px-6 py-4 text-[12px] font-medium text-muted-foreground">{formatDate(notice.published_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        {notice.status === 'draft' ? (
                          <>
                            <button
                              onClick={() => onPublish(notice.id)}
                              disabled={actionLoading === notice.id}
                              className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {actionLoading === notice.id ? '...' : '发布'}
                            </button>
                            <button
                              onClick={() => onDelete(notice.id, notice.title)}
                              disabled={actionLoading === notice.id}
                              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              删除
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => router.push(`/admin-analysis/notices/${notice.id}/edit`)}
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-medium text-primary transition-colors hover:bg-muted"
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

      <div className="border-t border-border p-2">
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
