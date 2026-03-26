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
    <div className="overflow-hidden rounded-none border border-[#c4c6cf] bg-[#f4f4f0] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#c4c6cf] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#002045]">评分明细</h2>
        <div className="flex items-center gap-2">
          {(['', 'nps', 'csat'] as RatingTypeFilter[]).map((filter) => (
            <button
              key={filter || 'all'}
              onClick={() => onFilterChange(filter)}
              className={`rounded-none border px-3 py-1 text-xs shadow-sm ${
                typeFilter === filter
                  ? 'border-[#002045] bg-[#002045] text-white'
                  : 'border-[#c4c6cf] bg-[#f4f4f0] text-[#002045]'
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
            <tr className="border-b border-[#c4c6cf]">
              {['类型', '分值', '分类', '评论', '时间'].map((header) => (
                <th key={header} className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-[#002045]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, row) => (
                <tr key={row} className="border-b border-[#ddd8cf]">
                  {Array.from({ length: 5 }).map((_, col) => (
                    <td key={col} className="px-4 py-3">
                      <div className="h-3 w-20 animate-pulse bg-[#e1ded1]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : ratingList && ratingList.ratings.length > 0 ? (
              ratingList.ratings.map((rating) => (
                <tr key={rating.id} className="border-b border-[#ddd8cf] last:border-b-0">
                  <td className="px-4 py-3 text-sm text-[#002045]">{rating.rating_type.toUpperCase()}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#002045]">{rating.score}</td>
                  <td className="px-4 py-3 text-sm text-[#74777f]">
                    {rating.rating_type === 'nps' ? resolveNpsCategory(rating.score) : '满意度评分'}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-[#74777f]">{rating.comment ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#74777f]">{formatDate(rating.created_at, 'zh-CN')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6">
                  <EmptyState title="暂无评分数据" description="当前筛选条件下没有评分记录。" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ratingList ? (
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
      ) : null}
    </div>
  );
}
