export interface BadgeStyle { label: string; className: string }
export type BadgeMap = Record<string, BadgeStyle>;

export function resolveBadgeStyle(map: BadgeMap, key: string | null | undefined, fallbackLabel?: string): BadgeStyle {
  if (key && map[key]) return map[key];
  return { label: fallbackLabel ?? key ?? '未知', className: 'bg-secondary text-muted-foreground ring-border' };
}

export const TIER_BADGE: BadgeMap = {
  free: { label: '免费版', className: 'bg-secondary text-muted-foreground ring-border' },
  pro: { label: '专业版', className: 'bg-primary/10 text-primary ring-primary/20' },
  pro_plus: { label: '增强版', className: 'bg-chart-5/10 text-chart-5 ring-chart-5/20' },
  ultra: { label: '旗舰版', className: 'bg-chart-3/10 text-chart-3 ring-chart-3/20' },
};

export const NOTICE_TYPE_BADGE: BadgeMap = {
  system: { label: '系统公告', className: 'bg-primary/10 text-primary ring-primary/20' },
  feature: { label: '功能更新', className: 'bg-accent/10 text-accent ring-accent/20' },
  promotion: { label: '活动推广', className: 'bg-chart-3/10 text-chart-3 ring-chart-3/20' },
  education: { label: '教育资讯', className: 'bg-chart-5/10 text-chart-5 ring-chart-5/20' },
  changelog: { label: '版本变更', className: 'bg-chart-2/10 text-chart-2 ring-chart-2/20' },
  maintenance: { label: '维护通知', className: 'bg-destructive/10 text-destructive ring-destructive/20' },
};

export const NOTICE_STATUS_BADGE: BadgeMap = {
  draft: { label: '草稿', className: 'bg-secondary text-muted-foreground ring-border' },
  published: { label: '已发布', className: 'bg-accent/10 text-accent ring-accent/20' },
  archived: { label: '已归档', className: 'bg-secondary text-muted-foreground/60 ring-border' },
};
