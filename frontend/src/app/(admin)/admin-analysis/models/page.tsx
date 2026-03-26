'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/services/admin.service';
import { EmptyState, KpiCard, PageHeader, formatDateTime } from '@/features/admin/shared';

interface ModelConfig {
  model_id: string;
  config: Record<string, unknown>;
  description: string | null;
  updated_at: string | null;
}

interface ModelStatusResponse {
  models: ModelConfig[];
}

interface ModelUsageStat {
  model_id: string;
  total_tokens: number;
  run_count: number;
}

interface ModelUsageResponse {
  usage: ModelUsageStat[];
  time_range: string;
}

type TimeRange = '7d' | '30d' | '90d';

export default function AdminModelsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [statusData, setStatusData] = useState<ModelStatusResponse | null>(null);
  const [usageData, setUsageData] = useState<ModelUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [status, usage] = await Promise.all([
        adminFetch<ModelStatusResponse>('/models/status'),
        adminFetch<ModelUsageResponse>(`/models/usage?time_range=${timeRange}`),
      ]);
      setStatusData(status);
      setUsageData(usage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '获取模型数据失败');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return (
    <div className="mx-auto min-h-full max-w-[1600px] space-y-6 bg-[#f4f4f0] px-8 py-8">
      <PageHeader
        title="模型配置"
        description={statusData ? `共 ${statusData.models.length} 个模型配置项` : '查看模型配置与用量统计'}
        action={
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-none border px-3 py-2 text-xs shadow-sm ${
                  timeRange === range
                    ? 'border-[#002045] bg-[#002045] text-white'
                    : 'border-[#c4c6cf] bg-[#f4f4f0] text-[#002045]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        }
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

      {usageData ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {usageData.usage.map((usage) => (
            <KpiCard
              key={usage.model_id}
              label={usage.model_id === 'all' ? '总 Token 用量' : usage.model_id}
              value={usage.total_tokens.toLocaleString('zh-CN')}
              sub={`${usage.run_count} 次调用 · ${timeRange}`}
            />
          ))}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-none border border-[#c4c6cf] bg-[#f4f4f0] shadow-sm">
        <div className="border-b border-[#c4c6cf] px-5 py-4">
          <h2 className="font-serif text-xl font-bold text-[#002045]">模型配置明细</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#c4c6cf]">
                {['模型 ID', '说明', '配置', '最后更新时间'].map((header) => (
                  <th key={header} className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-[#002045]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, row) => (
                  <tr key={row} className="border-b border-[#ddd8cf]">
                    {Array.from({ length: 4 }).map((_, col) => (
                      <td key={col} className="px-4 py-3">
                        <div className="h-3 w-24 animate-pulse bg-[#e1ded1]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : statusData && statusData.models.length > 0 ? (
                statusData.models.map((model) => (
                  <tr key={model.model_id} className="border-b border-[#ddd8cf] last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs text-[#002045]">{model.model_id}</td>
                    <td className="px-4 py-3 text-sm text-[#74777f]">{model.description ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#74777f]">{JSON.stringify(model.config)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#74777f]">{formatDateTime(model.updated_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6">
                    <EmptyState title="暂无模型配置" description="当前没有可展示的模型配置项。" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
