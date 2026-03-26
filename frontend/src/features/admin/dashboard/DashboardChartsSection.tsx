'use client';

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { DashboardCharts, DashboardTimeRange } from '@/types/admin';

interface DashboardChartsSectionProps {
  charts: DashboardCharts;
  timeRange: DashboardTimeRange;
  onTimeRangeChange: (value: DashboardTimeRange) => void;
}

const TIME_RANGE_OPTIONS: { value: DashboardTimeRange; label: string }[] = [
  { value: '7d', label: '近 7 天' },
  { value: '30d', label: '近 30 天' },
  { value: '90d', label: '近 90 天' },
];

const tooltipStyle = {
  backgroundColor: '#f4f4f0',
  border: '1px solid #c4c6cf',
  borderRadius: '0px',
  color: '#002045',
};

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
      className="relative overflow-hidden border border-[#c4c6cf] bg-[#f4f4f0] p-6 shadow-sm"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(0,32,69,0.035), rgba(0,32,69,0.035) 1px, transparent 1px, transparent 16px)',
        }}
      />
      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#002045]">{title}</h2>
            <p className="mt-2 font-mono text-[10px] tracking-[0.16em] text-[#74777f]">
              {description}
            </p>
          </div>
          {action}
        </div>
        {children}
      </div>
    </motion.section>
  );
}

export function DashboardChartsSection({
  charts,
  timeRange,
  onTimeRangeChange,
}: DashboardChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <ChartShell
        title="用户增长趋势"
        description="注册用户与教育邮箱注册趋势"
        action={
          <div className="flex gap-2">
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onTimeRangeChange(option.value)}
                className={`border px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] shadow-sm ${
                  option.value === timeRange
                    ? 'border-[#002045] bg-[#002045] text-white'
                    : 'border-[#c4c6cf] bg-[#f4f4f0] text-[#002045] hover:bg-[#ebe9df]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={charts.signups_chart}>
              <CartesianGrid stroke="#d5d0c6" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#74777f" fontSize={12} />
              <YAxis stroke="#74777f" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="signups" fill="#002045" name="新增注册" />
              <Line
                type="monotone"
                dataKey="edu_signups"
                stroke="#6f7d95"
                strokeWidth={2}
                dot={{ r: 2 }}
                name="教育邮箱注册"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartShell>

      <ChartShell title="工作流执行趋势" description="总执行次数、成功次数、失败次数与 Token 消耗">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={charts.workflow_chart}>
              <CartesianGrid stroke="#d5d0c6" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#74777f" fontSize={12} />
              <YAxis yAxisId="left" stroke="#74777f" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#74777f" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar yAxisId="left" dataKey="total_runs" fill="#002045" name="总执行次数" />
              <Line yAxisId="left" type="monotone" dataKey="success" stroke="#2f855a" strokeWidth={2} name="成功" />
              <Line yAxisId="left" type="monotone" dataKey="failed" stroke="#c53030" strokeWidth={2} name="失败" />
              <Line yAxisId="right" type="monotone" dataKey="total_tokens" stroke="#8c6d1f" strokeWidth={2} name="Token" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartShell>
    </div>
  );
}
