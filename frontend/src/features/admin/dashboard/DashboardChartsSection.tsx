'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  AdminUsageRange,
  CostSplitResponse,
  ModelBreakdownResponse,
  UsageTimeseriesResponse,
} from '@/types/usage';

interface DashboardChartsSectionProps {
  timeseries: UsageTimeseriesResponse;
  modelBreakdown: ModelBreakdownResponse;
  costSplit: CostSplitResponse;
  timeRange: AdminUsageRange;
  onTimeRangeChange: (value: AdminUsageRange) => void;
}

const TIME_RANGE_OPTIONS: { value: AdminUsageRange; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
];

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0', // slate-200
  borderRadius: '0.75rem',     // xl
  color: '#0f172a',            // slate-900
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
};

function formatCny(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 4,
  }).format(value);
}

function ChartShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          {action}
        </div>
        <div className="flex-1 min-h-[300px]">
          {children}
        </div>
      </div>
    </motion.section>
  );
}

export function DashboardChartsSection({
  timeseries,
  modelBreakdown,
  costSplit,
  timeRange,
  onTimeRangeChange,
}: DashboardChartsSectionProps) {
  const chartData = timeseries.points.map((point) => ({
    ts: point.ts,
    assistant_calls: point.assistant_calls,
    workflow_calls: point.workflow_calls,
    assistant_tokens: point.assistant_tokens,
    workflow_tokens: point.workflow_tokens,
    assistant_cost_cny: point.assistant_cost_cny,
    workflow_cost_cny: point.workflow_cost_cny,
  }));

  const pieData = costSplit.items.map((item) => ({
    name: item.source_type === 'assistant' ? 'Assistant' : 'Workflow',
    value: item.total_cost_cny,
  }));

  const topModels = modelBreakdown.items.slice(0, 8);

  // Colors: Assistant -> Indigo-500, Workflow -> Teal-500
  const colorAssistant = '#6366f1';
  const colorWorkflow = '#14b8a6';

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <ChartShell
        title="调用次数趋势"
        description="Assistant 与 Workflow 的真实 Provider 调用次数"
        action={(
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 shadow-inner">
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onTimeRangeChange(option.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  option.value === timeRange
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="ts" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
            <Bar dataKey="assistant_calls" fill={colorAssistant} name="Assistant" radius={[4, 4, 0, 0]} />
            <Bar dataKey="workflow_calls" fill={colorWorkflow} name="Workflow" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Token 趋势" description="成功调用的 Token 消耗分布">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="ts" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
            <Line type="monotone" dataKey="assistant_tokens" stroke={colorAssistant} strokeWidth={3} dot={false} name="Assistant Tokens" activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="workflow_tokens" stroke={colorWorkflow} strokeWidth={3} dot={false} name="Workflow Tokens" activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="费用趋势" description="人民币 (CNY) 总成本走势">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="ts" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [formatCny(value), 'Cost']}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
            <Line type="monotone" dataKey="assistant_cost_cny" stroke={colorAssistant} strokeWidth={3} dot={false} name="Assistant Cost" activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="workflow_cost_cny" stroke={colorWorkflow} strokeWidth={3} dot={false} name="Workflow Cost" activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="成本拆分与模型排行" description="账单来源拆分与具体模型成本一览">
        <div className="grid h-full gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [formatCny(value), 'Cost']}
                  />
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={60} stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={index === 0 ? colorAssistant : colorWorkflow} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-4 py-3 font-semibold text-slate-900">SKU / Model</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Calls</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Tokens</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topModels.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                        暂无模型账本数据
                      </td>
                    </tr>
                  ) : (
                    topModels.map((item) => (
                      <tr key={item.sku_id ?? `${item.provider}-${item.model}`} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{item.provider}/{item.model}</div>
                          <div className="mt-0.5 text-xs text-slate-500">{item.vendor} · {item.billing_channel}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.provider_call_count.toLocaleString('zh-CN')}</td>
                        <td className="px-4 py-3 text-slate-600">{item.total_tokens.toLocaleString('zh-CN')}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{formatCny(item.total_cost_cny)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ChartShell>
    </div>
  );
}
