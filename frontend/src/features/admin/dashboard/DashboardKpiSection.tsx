import type { DashboardOverview } from '@/types/admin';
import { KpiCard, formatNumber } from '@/features/admin/shared';

interface DashboardKpiSectionProps {
  overview: DashboardOverview;
}

export function DashboardKpiSection({ overview }: DashboardKpiSectionProps) {
  const cards = [
    { label: '注册用户总数', value: formatNumber(overview.total_users), sub: 'user_profiles' },
    { label: '当前活跃用户', value: formatNumber(overview.active_users), sub: 'is_active = true' },
    { label: '今日新增用户', value: formatNumber(overview.today_signups), sub: 'v_daily_signups' },
    { label: '今日执行次数', value: formatNumber(overview.today_workflow_runs), sub: 'ss_workflow_runs' },
    { label: '工作流累计执行', value: formatNumber(overview.total_workflow_runs), sub: '历史累计' },
    { label: '有效订阅数', value: formatNumber(overview.active_subscriptions), sub: 'subscriptions' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <KpiCard key={card.label} label={card.label} value={card.value} sub={card.sub} />
      ))}
    </div>
  );
}
