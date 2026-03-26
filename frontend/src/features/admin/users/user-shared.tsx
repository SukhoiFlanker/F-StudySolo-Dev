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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-xs font-medium border ${badge.className}`}>
      {badge.label}
    </span>
  );
}

export function StatusBadgeWithDot({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-xs font-medium border ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-red-50 text-red-700 border-red-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {isActive ? '正常' : '停用'}
    </span>
  );
}

export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[#c4c6cf]/60 last:border-0">
      <span className="text-[#74777f] text-sm">{label}</span>
      <span className="text-[#002045] text-sm text-right">{children}</span>
    </div>
  );
}
