export interface BadgeStyle {
  label: string;
  className: string;
}

export type BadgeMap = Record<string, BadgeStyle>;

/** Look up a badge style from a map, with a paper-theme fallback. */
export function resolveBadgeStyle(
  map: BadgeMap,
  key: string | null | undefined,
  fallbackLabel?: string,
): BadgeStyle {
  if (key && map[key]) {
    return map[key];
  }

  return {
    label: fallbackLabel ?? key ?? '未知',
    className: 'border border-[#c4c6cf] bg-[#f4f4f0] text-[#74777f]',
  };
}

export const TIER_BADGE: BadgeMap = {
  free: { label: '免费版', className: 'border border-stone-300 bg-stone-100 text-stone-700' },
  pro: { label: '专业版', className: 'border border-blue-200 bg-blue-50 text-blue-800' },
  pro_plus: { label: '专业增强版', className: 'border border-indigo-200 bg-indigo-50 text-indigo-800' },
  ultra: { label: '旗舰版', className: 'border border-amber-200 bg-amber-50 text-amber-800' },
};

export const NOTICE_TYPE_BADGE: BadgeMap = {
  system: { label: '系统公告', className: 'border border-blue-200 bg-blue-50 text-blue-800' },
  feature: { label: '功能更新', className: 'border border-emerald-200 bg-emerald-50 text-emerald-800' },
  promotion: { label: '活动推广', className: 'border border-amber-200 bg-amber-50 text-amber-800' },
  education: { label: '教育资讯', className: 'border border-violet-200 bg-violet-50 text-violet-800' },
  changelog: { label: '版本变更', className: 'border border-cyan-200 bg-cyan-50 text-cyan-800' },
  maintenance: { label: '维护通知', className: 'border border-red-200 bg-red-50 text-red-700' },
};

export const NOTICE_STATUS_BADGE: BadgeMap = {
  draft: { label: '草稿', className: 'border border-stone-300 bg-stone-100 text-stone-700' },
  published: { label: '已发布', className: 'border border-emerald-200 bg-emerald-50 text-emerald-800' },
  archived: { label: '已归档', className: 'border border-slate-300 bg-slate-100 text-slate-700' },
};
