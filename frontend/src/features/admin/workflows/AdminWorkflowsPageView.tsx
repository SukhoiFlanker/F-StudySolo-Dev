'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { adminFetch } from '@/services/admin.service';
import type {
  ErrorWorkflowsResponse,
  RunningWorkflowsResponse,
  WorkflowStatsResponse,
  WorkflowTimeRange,
} from '@/types/admin';
import {
  KpiCard,
  PageHeader,
  TableSkeletonRows,
  formatDateTime,
  formatDuration,
  truncateId,
} from '@/features/admin/shared';

const TIME_RANGE_OPTIONS = [
  ['7d', '近 7 天'],
  ['30d', '近 30 天'],
  ['90d', '近 90 天'],
] as const satisfies readonly [WorkflowTimeRange, string][];

const RUNNING_HEADERS = ['运行 ID', '工作流 ID', '用户 ID', '开始时间', '当前进度', '已耗时'];
const ERROR_HEADERS = ['运行 ID', '工作流 ID', '用户 ID', '状态', '开始时间', '总耗时'];

interface WorkflowTableSectionProps {
  title: string;
  total: number;
  headers: string[];
  loading: boolean;
  emptyText: string;
  emptyColSpan: number;
  accentClassName: string;
  children: ReactNode;
}

function WorkflowTableSection({
  title,
  total,
  headers,
  loading,
  emptyText,
  emptyColSpan,
  accentClassName,
  children,
}: WorkflowTableSectionProps) {
  return (
    <section className="border border-[#c4c6cf] bg-[#f4f4f0] shadow-sm">
      <div className={`flex items-center justify-between border-b-2 px-6 py-4 ${accentClassName}`}>
        <h2 className="font-mono text-sm font-bold tracking-widest">{title}</h2>
        <span className="font-mono text-[10px] tracking-widest">共 {total} 条</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#002045]/20 bg-[#ebe9df]">
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 font-mono text-[10px] font-bold tracking-[0.2em] text-[#002045]/60"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonRows rows={3} cols={emptyColSpan} />
            ) : (
              children || (
                <tr>
                  <td
                    colSpan={emptyColSpan}
                    className="bg-[#f4f4f0] px-6 py-12 text-center font-mono text-xs tracking-widest text-[#74777f]"
                  >
                    {emptyText}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminWorkflowsPageView() {
  const [timeRange, setTimeRange] = useState<WorkflowTimeRange>('7d');
  const [statsData, setStatsData] = useState<WorkflowStatsResponse | null>(null);
  const [runningData, setRunningData] = useState<RunningWorkflowsResponse | null>(null);
  const [errorsData, setErrorsData] = useState<ErrorWorkflowsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [stats, running, errors] = await Promise.all([
        adminFetch<WorkflowStatsResponse>(`/workflows/stats?time_range=${timeRange}`),
        adminFetch<RunningWorkflowsResponse>('/workflows/running'),
        adminFetch<ErrorWorkflowsResponse>('/workflows/errors'),
      ]);
      setStatsData(stats);
      setRunningData(running);
      setErrorsData(errors);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载工作流监控数据失败');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const stats = statsData?.stats;

  return (
    <div className="mx-auto min-h-full max-w-[1600px] space-y-10 px-8 py-8 md:px-12">
      <PageHeader
        title="工作流监控"
        description={
          runningData
            ? `当前有 ${runningData.total} 个运行实例正在执行`
            : '查看工作流运行状态、失败记录与时间范围统计。'
        }
        action={
          <div className="flex items-center gap-2 border border-[#c4c6cf] bg-[#f4f4f0] p-1 shadow-sm">
            {TIME_RANGE_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={`px-4 py-2 font-mono text-[10px] font-bold tracking-widest transition-all ${
                  timeRange === value
                    ? 'bg-[#002045] text-white'
                    : 'text-[#74777f] hover:bg-[#ebe9df] hover:text-[#002045]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      {error ? (
        <div className="flex items-center justify-between border border-[#c4c6cf] border-l-4 border-l-red-600 bg-[#f4f4f0] p-4 font-mono text-sm shadow-sm">
          <span className="font-bold tracking-wide text-red-700">系统错误：{error}</span>
          <button
            onClick={() => void fetchAll()}
            className="text-[10px] font-bold tracking-widest text-[#002045] underline-offset-4 hover:text-red-700 hover:underline"
          >
            重新加载
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 border border-[#c4c6cf]/60 bg-[#f4f4f0] p-6 shadow-sm" />
          ))
        ) : stats ? (
          <>
            <KpiCard label="总执行次数" value={stats.total_runs.toLocaleString('zh-CN')} sub={`统计范围 ${timeRange}`} />
            <KpiCard label="成功率" value={`${(stats.success_rate * 100).toFixed(1)}%`} sub={`已完成 ${stats.completed}`} />
            <KpiCard label="平均执行时长" value={formatDuration(stats.avg_duration_seconds)} sub="仅统计已完成任务" />
            <KpiCard label="Token 总消耗" value={stats.total_tokens_used.toLocaleString('zh-CN')} sub={`统计范围 ${timeRange}`} />
          </>
        ) : null}
      </div>

      {stats ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['已完成执行', stats.completed, 'border-t-emerald-700 text-[#002045]'],
            ['运行中任务', stats.running, 'border-t-blue-600 text-[#002045]'],
            ['失败任务', stats.failed, 'border-t-red-600 text-red-700'],
          ].map(([label, value, accentClassName]) => (
            <section
              key={label}
              className={`flex flex-col items-center justify-center border border-[#c4c6cf] border-t-8 bg-[#f4f4f0] p-6 shadow-sm ${accentClassName}`}
            >
              <p className="mb-4 font-mono text-[10px] font-bold tracking-[0.25em] text-[#002045]/60">
                {label}
              </p>
              <p className="font-serif text-5xl font-black">{value}</p>
            </section>
          ))}
        </div>
      ) : null}

      <WorkflowTableSection
        title="运行中实例"
        total={runningData?.total ?? 0}
        headers={RUNNING_HEADERS}
        loading={loading}
        emptyText="暂无运行中任务"
        emptyColSpan={6}
        accentClassName="border-[#002045] bg-[#f4f4f0] text-[#002045]"
      >
        {runningData?.running.length
          ? runningData.running.map((workflow) => (
              <tr
                key={workflow.id}
                className="border-b border-[#c4c6cf]/30 transition-colors hover:bg-[#ebe9df]"
              >
                <td className="px-6 py-4 font-mono text-xs font-bold uppercase tracking-wider text-[#002045]">
                  #{truncateId(workflow.id)}
                </td>
                <td className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-[#43474e]">
                  {truncateId(workflow.workflow_id)}
                </td>
                <td className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-[#43474e]">
                  {truncateId(workflow.user_id)}
                </td>
                <td className="px-6 py-4 font-mono text-[11px] tracking-wider text-[#74777f]">
                  {formatDateTime(workflow.started_at)}
                </td>
                <td className="px-6 py-4 font-mono text-xs font-bold tracking-widest text-[#002045]">
                  {workflow.total_steps ? `${workflow.current_step ?? 0}/${workflow.total_steps}` : workflow.current_node ?? '等待中'}
                </td>
                <td className="px-6 py-4 font-mono text-[11px] tracking-wide text-[#74777f]">
                  {formatDuration(workflow.elapsed_seconds)}
                </td>
              </tr>
            ))
          : null}
      </WorkflowTableSection>

      <WorkflowTableSection
        title="异常记录"
        total={errorsData?.total ?? 0}
        headers={ERROR_HEADERS}
        loading={loading}
        emptyText="暂无异常任务"
        emptyColSpan={6}
        accentClassName="border-red-700 bg-red-50/40 text-red-800"
      >
        {errorsData?.errors.length
          ? errorsData.errors.map((workflow) => (
              <tr
                key={workflow.id}
                className="border-b border-[#c4c6cf]/30 transition-colors hover:bg-red-50/40"
              >
                <td className="px-6 py-4 font-mono text-xs font-bold uppercase tracking-wider text-[#002045]">
                  #{truncateId(workflow.id)}
                </td>
                <td className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-[#43474e]">
                  {truncateId(workflow.workflow_id)}
                </td>
                <td className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-[#43474e]">
                  {truncateId(workflow.user_id)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center border border-red-200 bg-red-50 px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-red-700">
                    {workflow.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-[11px] tracking-wider text-[#74777f]">
                  {formatDateTime(workflow.started_at)}
                </td>
                <td className="px-6 py-4 font-mono text-[11px] tracking-wide text-[#74777f]">
                  {formatDuration(workflow.elapsed_seconds)}
                </td>
              </tr>
            ))
          : null}
      </WorkflowTableSection>
    </div>
  );
}
