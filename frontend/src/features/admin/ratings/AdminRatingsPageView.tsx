'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/services/admin.service';
import type { PaginatedRatingList, RatingOverview, RatingTypeFilter } from '@/types/admin';
import { KpiCard, PageHeader } from '@/features/admin/shared';
import { AdminRatingsTable } from './AdminRatingsTable';

export function AdminRatingsPageView() {
  const [overview, setOverview] = useState<RatingOverview | null>(null);
  const [ratingList, setRatingList] = useState<PaginatedRatingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<RatingTypeFilter>('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const typeParam = typeFilter ? `&rating_type=${typeFilter}` : '';
      const [ov, list] = await Promise.all([
        adminFetch<RatingOverview>('/ratings/overview'),
        adminFetch<PaginatedRatingList>(`/ratings/details?page=${page}&page_size=20${typeParam}`),
      ]);
      setOverview(ov);
      setRatingList(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载评分数据失败');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return (
    <div className="mx-auto min-h-full max-w-[1600px] space-y-6 bg-[#f4f4f0] px-8 py-8">
      <PageHeader
        title="评分数据"
        description={overview ? `共 ${overview.nps_count + overview.csat_count} 条用户反馈` : '查看 NPS 与 CSAT 评分情况'}
      />

      {error ? (
        <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <button onClick={() => void fetchAll()} className="text-xs underline">
              重新加载
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <KpiCard
          label="NPS 评分"
          value={overview?.nps_score !== null && overview?.nps_score != null ? overview.nps_score.toFixed(1) : '—'}
          sub={overview ? `共 ${overview.nps_count} 条，平均 ${overview.nps_avg?.toFixed(1) ?? '—'}` : '加载中'}
        />
        <KpiCard
          label="CSAT 满意度"
          value={overview?.csat_avg !== null && overview?.csat_avg != null ? overview.csat_avg.toFixed(2) : '—'}
          sub={overview ? `共 ${overview.csat_count} 条反馈` : '加载中'}
        />
      </div>

      <AdminRatingsTable
        loading={loading}
        ratingList={ratingList}
        page={page}
        typeFilter={typeFilter}
        onFilterChange={(filter) => {
          setTypeFilter(filter);
          setPage(1);
        }}
        onPrevPage={() => setPage((current) => Math.max(1, current - 1))}
        onNextPage={() => {
          if (!ratingList) return;
          setPage((current) => Math.min(ratingList.total_pages, current + 1));
        }}
      />
    </div>
  );
}
