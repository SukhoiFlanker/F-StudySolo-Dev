'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="mx-auto min-h-full max-w-[1600px] space-y-6 px-8 py-8">
      <PageHeader
        title="数据概览"
        description="关键指标、趋势曲线与最近后台活动。"
        eyebrow="系统总览协议"
        action={
          <button
            onClick={() => void fetchDashboard()}
            className="border border-[#002045] bg-[#002045] px-5 py-2.5 font-['Space_Grotesk'] text-sm font-semibold tracking-[0.08em] text-white shadow-sm transition-opacity hover:opacity-90"
          >
            刷新数据
          </button>
        }
      />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]"
      >
        <div className="space-y-6">
          {error ? (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <span>{error}</span>
                <button
                  onClick={() => void fetchDashboard()}
                  className="font-mono text-[10px] tracking-[0.16em] underline"
                >
                  重新加载
                </button>
              </div>
            </div>
          ) : null}

          {loading && !overview && !charts ? (
            <EmptyState
              title="正在加载数据概览"
              description="正在从后端读取 dashboard 与审计统计。"
            />
          ) : null}

          {overview ? <DashboardKpiSection overview={overview} /> : null}
          {charts ? (
            <DashboardChartsSection
              charts={charts}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          ) : null}
        </div>

        <aside className="border border-[#c4c6cf] bg-[#efeeea] p-6 shadow-sm">
          <p className="font-serif text-2xl font-bold text-[#002045]">观察面板</p>
          <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-[#74777f]">
            INSPECTION_PANE
          </p>
          <div className="mt-6 space-y-6">
            <section className="border border-[#c4c6cf] bg-[#f4f4f0] p-4 shadow-sm">
              <p className="font-mono text-[10px] tracking-[0.16em] text-[#74777f]">
                当前周期
              </p>
              <p className="mt-2 font-serif text-2xl font-bold text-[#002045]">{timeRange}</p>
              <p className="mt-3 text-sm leading-6 text-[#43474e]">
                当前正在查看注册趋势、工作流执行与最近五条后台审计记录。
              </p>
            </section>

            <section className="border border-[#c4c6cf] bg-[#f4f4f0] p-4 shadow-sm">
              <p className="font-mono text-[10px] tracking-[0.16em] text-[#74777f]">
                审计流状态
              </p>
              <div className="mt-3 flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-[#002045]">
                <span className="h-2 w-2 animate-pulse bg-[#002045]" />
                后台审计在线
              </div>
              <p className="mt-3 text-sm leading-6 text-[#43474e]">
                如需进一步追踪配置变更或管理员动作，可直接进入审计日志页查看详情。
              </p>
            </section>
          </div>
        </aside>
      </motion.section>

      <DashboardActivityTable logs={logs} loading={loading} />
    </div>
  );
}
