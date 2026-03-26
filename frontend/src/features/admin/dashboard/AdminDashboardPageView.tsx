'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAuditLogs, getDashboardCharts, getDashboardOverview } from '@/services/admin.service';
import type {
  DashboardCharts,
  DashboardOverview,
  DashboardTimeRange,
  PaginatedAuditLogs,
} from '@/types/admin';
import { EmptyState, PageHeader } from '@/features/admin/shared';
import { DashboardActivityTable } from './DashboardActivityTable';
import { DashboardChartsSection } from './DashboardChartsSection';
import { DashboardKpiSection } from './DashboardKpiSection';

export function AdminDashboardPageView() {
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>('7d');
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [logs, setLogs] = useState<PaginatedAuditLogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activityParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('page_size', '5');
    return params;
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewResult, chartsResult, logsResult] = await Promise.all([
        getDashboardOverview(),
        getDashboardCharts(timeRange),
        getAuditLogs(activityParams),
      ]);
      setOverview(overviewResult);
      setCharts(chartsResult);
      setLogs(logsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据概览失败');
    } finally {
      setLoading(false);
    }
  }, [activityParams, timeRange]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="mx-auto min-h-full max-w-[1600px] space-y-6 bg-[#f4f4f0] px-8 py-8">
      <PageHeader
        title="数据概览"
        description="后台关键指标、趋势图表与近期活动"
        action={
          <button
            onClick={() => void fetchDashboard()}
            className="rounded-none border border-[#002045] bg-[#002045] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
          >
            刷新数据
          </button>
        }
      />

      {error ? (
        <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <button onClick={() => void fetchDashboard()} className="text-xs underline">
              重新加载
            </button>
          </div>
        </div>
      ) : null}

      {loading && !overview && !charts ? (
        <EmptyState title="正在加载数据概览" description="正在从后端读取 Dashboard 与审计数据。" />
      ) : null}

      {overview ? <DashboardKpiSection overview={overview} /> : null}
      {charts ? (
        <DashboardChartsSection charts={charts} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      ) : null}
      <DashboardActivityTable logs={logs} loading={loading} />
    </div>
  );
}
