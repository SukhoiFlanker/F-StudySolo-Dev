import type { ReactNode } from 'react';
import { TIER_BADGE, resolveBadgeStyle } from '@/features/admin/shared';

export const TIER_OPTIONS = [
  { value: 'free', label: '免费版' },
  { value: 'pro', label: '专业版' },
  { value: 'pro_plus', label: '专业增强版' },
  { value: 'ultra', label: '旗舰版' },
] as const;

export function TierBadge({ tier }: { tier: string }) {
  const badge = resolveBadgeStyle(TIER_BADGE, tier, tier);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border shadow-sm ${badge.className}`}>
      {badge.label}
    </span>
  );
}

export function StatusBadgeWithDot({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border shadow-sm ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
          : 'bg-red-50 text-red-700 border-red-200/60'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {isActive ? '正常' : '停用'}
    </span>
  );
}

export function InfoRow({ label, children, border = true }: { label: string; children: ReactNode; border?: boolean }) {
  return (
    <div className={`flex items-start justify-between py-3.5 ${border ? 'border-b border-slate-100 last:border-0' : ''}`}>
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900 text-right">{children}</span>
    </div>
  );
}
