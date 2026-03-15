export interface BadgeStyle {
  label: string;
  className: string;
}

export type BadgeMap = Record<string, BadgeStyle>;

/** Look up a badge style from a map, with a fallback. */
export function resolveBadgeStyle(
  map: BadgeMap,
  key: string | null | undefined,
  fallbackLabel?: string,
): BadgeStyle {
  if (key && map[key]) return map[key];
  return {
    label: fallbackLabel ?? key ?? 'Unknown',
    className: 'bg-white/10 text-white/60 border-white/20',
  };
}

export const TIER_BADGE: BadgeMap = {
  free: { label: 'Free', className: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  pro: { label: 'Pro', className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  pro_plus: { label: 'Pro+', className: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  ultra: { label: 'Ultra', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
};

export const NOTICE_TYPE_BADGE: BadgeMap = {
  system: { label: 'System', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  feature: { label: 'Feature', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  promotion: { label: 'Promotion', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  education: { label: 'Education', className: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  changelog: { label: 'Changelog', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  maintenance: { label: 'Maintenance', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

export const NOTICE_STATUS_BADGE: BadgeMap = {
  draft: { label: 'Draft', className: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  published: { label: 'Published', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  archived: { label: 'Archived', className: 'bg-white/10 text-white/40 border-white/20' },
};
