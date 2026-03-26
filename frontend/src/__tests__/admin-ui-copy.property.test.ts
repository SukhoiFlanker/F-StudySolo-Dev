import { describe, expect, it } from 'vitest';
import { ADMIN_NAV_ITEMS } from '@/features/admin/shared/AdminSidebar';
import {
  NOTICE_STATUS_BADGE,
  NOTICE_TYPE_BADGE,
  TIER_BADGE,
} from '@/features/admin/shared/badges';

function containsChinese(value: string) {
  return /[\u4e00-\u9fff]/.test(value);
}

describe('admin ui copy', () => {
  it('uses Chinese labels for every sidebar item and excludes billing from Wave 1 navigation', () => {
    for (const item of ADMIN_NAV_ITEMS) {
      expect(containsChinese(item.label)).toBe(true);
      expect(item.href).not.toBe('/admin-analysis/billing');
    }
  });

  it('uses Chinese labels for tier and notice badges', () => {
    const allLabels = [
      ...Object.values(TIER_BADGE).map((item) => item.label),
      ...Object.values(NOTICE_TYPE_BADGE).map((item) => item.label),
      ...Object.values(NOTICE_STATUS_BADGE).map((item) => item.label),
    ];

    for (const label of allLabels) {
      expect(containsChinese(label)).toBe(true);
    }
  });
});
