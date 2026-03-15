// ============================================================
// Admin shared module — barrel re-export
// ============================================================

// Utils
export {
  formatDate,
  formatDateTime,
  formatDuration,
  truncateId,
  maskEmail,
  buildPaginationParams,
} from './utils';

// Badge constants & resolver
export {
  resolveBadgeStyle,
  TIER_BADGE,
  NOTICE_TYPE_BADGE,
  NOTICE_STATUS_BADGE,
} from './badges';
export type { BadgeStyle, BadgeMap } from './badges';

// Shared UI components
export {
  PageHeader,
  KpiCard,
  TableSkeletonRows,
  Pagination,
  StatusBadge,
  ToastStack,
} from './components';

// Layout components
export { AdminSidebar } from './AdminSidebar';
export { AdminTopbar } from './AdminTopbar';
