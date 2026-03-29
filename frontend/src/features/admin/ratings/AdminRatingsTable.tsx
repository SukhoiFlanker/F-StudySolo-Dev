import type { PaginatedRatingList, RatingTypeFilter } from '@/types/admin';
import { EmptyState, Pagination, formatDate } from '@/features/admin/shared';

function resolveNpsCategory(score: number): string {
  if (score >= 9) return '推荐者';
  if (score >= 7) return '中立者';
  return '贬损者';
}

interface AdminRatingsTableProps {
  loading: boolean;
  ratingList: PaginatedRatingList | null;
  page: number;
  typeFilter: RatingTypeFilter;
  onFilterChange: (value: RatingTypeFilter) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function AdminRatingsTable({
  loading,
  ratingList,
  page,
  typeFilter,
  onFilterChange,
  onPrevPage,
  onNextPage,
}: AdminRatingsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
        <h2 className="text-base font-bold text-slate-900">评分明细</h2>
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
          {(['', 'nps', 'csat'] as RatingTypeFilter[]).map((filter) => (
            <button
              key={filter || 'all'}
              onClick={() => onFilterChange(filter)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                typeFilter === filter
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {filter === '' ? '全部' : filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {['类型', '分值', '分类', '评论', '时间'].map((header) => (
                <th key={header} className="px-6 py-3.5 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              Array.from({ length: 5 }).map((_, row) => (
                <tr key={row}>
                  {Array.from({ length: 5 }).map((_, col) => (
                    <td key={col} className="px-6 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : ratingList && ratingList.ratings.length > 0 ? (
              ratingList.ratings.map((rating) => (
                <tr key={rating.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                      {rating.rating_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-700">{rating.score}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {rating.rating_type === 'nps' ? resolveNpsCategory(rating.score) : '满意度评分'}
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-600">{rating.comment ?? '—'}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{formatDate(rating.created_at, 'zh-CN')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8">
                  <EmptyState title="暂无评分数据" description="当前筛选条件下没有评分记录。" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ratingList ? (
        <div className="border-t border-slate-100 p-2">
          <Pagination
            page={page}
            totalPages={ratingList.total_pages}
            total={ratingList.total}
            loading={loading}
            onPageChange={(targetPage) => {
              if (targetPage < page) onPrevPage();
              if (targetPage > page) onNextPage();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
