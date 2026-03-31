import type { PaginatedRatingList, RatingScoreFilter } from '@/types/admin';
import { EmptyState, Pagination, formatDate } from '@/features/admin/shared';

const STAR_LABELS: Record<number, string> = {
  1: '非常不满意',
  2: '不满意',
  3: '一般',
  4: '满意',
  5: '非常满意',
};

interface AdminRatingsTableProps {
  loading: boolean;
  ratingList: PaginatedRatingList | null;
  page: number;
  scoreFilter: RatingScoreFilter;
  onFilterChange: (value: RatingScoreFilter) => void;
  onPageChange: (page: number) => void;
}

export function AdminRatingsTable({
  loading,
  ratingList,
  page,
  scoreFilter,
  onFilterChange,
  onPageChange,
}: AdminRatingsTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-card">
        <h2 className="text-[14px] font-semibold text-foreground">反馈明细</h2>
        <div className="flex items-center rounded-lg border border-border bg-secondary p-0.5">
          {(['' as RatingScoreFilter, 5, 4, 3, 2, 1] as RatingScoreFilter[]).map((filter) => (
            <button
              key={filter === '' ? 'all' : filter}
              onClick={() => onFilterChange(filter)}
              className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${
                scoreFilter === filter
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter === '' ? '全部' : `${filter}★`}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-card">
              {['用户', '评分', '问题类型', '反馈内容', '奖励', '时间'].map((header) => (
                <th key={header} className="px-6 py-3.5 text-left text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {loading ? (
              Array.from({ length: 5 }).map((_, row) => (
                <tr key={row}>
                  {Array.from({ length: 6 }).map((_, col) => (
                    <td key={col} className="px-6 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                    </td>
                  ))}
                </tr>
              ))
            ) : ratingList && ratingList.ratings.length > 0 ? (
              ratingList.ratings.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-muted">
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-medium text-foreground">{item.nickname || '匿名用户'}</div>
                    <div className="text-[12px] text-muted-foreground/60">{item.email || item.user_id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[13px] font-medium text-muted-foreground">{item.rating}</span>
                      <span className="text-[12px] text-muted-foreground/60">{STAR_LABELS[item.rating] ?? ''}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.issue_type ? (
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-[12px] font-medium text-muted-foreground">
                        {item.issue_type}
                      </span>
                    ) : <span className="text-muted-foreground/60">—</span>}
                  </td>
                  <td className="max-w-xs px-6 py-4 text-[13px] text-muted-foreground">
                    <span className="line-clamp-2">{item.content}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium ${
                      item.reward_applied
                        ? 'bg-accent/10 text-accent'
                        : 'bg-card text-muted-foreground'
                    }`}>
                      {item.reward_applied ? `+${item.reward_days}天` : '未发放'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[12px] font-medium text-muted-foreground whitespace-nowrap">{formatDate(item.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8">
                  <EmptyState title="暂无反馈数据" description="当前筛选条件下没有用户反馈记录。" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ratingList && (
        <div className="border-t border-border p-2">
          <Pagination
            page={page}
            totalPages={ratingList.total_pages}
            total={ratingList.total}
            loading={loading}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
