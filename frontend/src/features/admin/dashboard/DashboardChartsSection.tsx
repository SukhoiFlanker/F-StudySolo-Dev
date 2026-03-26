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
import type { DashboardCharts, DashboardTimeRange } from '@/types/admin';

interface DashboardChartsSectionProps {
  charts: DashboardCharts;
  timeRange: DashboardTimeRange;
  onTimeRangeChange: (value: DashboardTimeRange) => void;
}

const TIME_RANGE_OPTIONS: DashboardTimeRange[] = ['7d', '30d', '90d'];

const tooltipStyle = {
  backgroundColor: '#f4f4f0',
  border: '1px solid #c4c6cf',
  borderRadius: '0px',
  color: '#002045',
};

export function DashboardChartsSection({
  charts,
  timeRange,
  onTimeRangeChange,
}: DashboardChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <section className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#002045]">用户增长趋势</h2>
            <p className="mt-2 font-mono text-[10px] tracking-widest text-[#74777f]">
              注册用户与教育邮箱注册趋势
            </p>
          </div>
          <div className="flex gap-2">
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => onTimeRangeChange(option)}
                className={`rounded-none border px-3 py-1.5 font-mono text-[10px] tracking-widest shadow-sm ${
                  option === timeRange
                    ? 'border-[#002045] bg-[#002045] text-white'
                    : 'border-[#c4c6cf] bg-[#f4f4f0] text-[#002045]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

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
      </section>

      <section className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold text-[#002045]">工作流执行趋势</h2>
          <p className="mt-2 font-mono text-[10px] tracking-widest text-[#74777f]">
            总执行次数、成功次数、失败次数与 Token 消耗
          </p>
        </div>

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
      </section>
    </div>
  );
}
