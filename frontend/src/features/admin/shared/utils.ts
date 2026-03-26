export function formatDate(value: string | null | undefined, locale = 'en-CA'): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(locale);
  } catch {
    return '—';
  }
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '0';
  return value.toLocaleString('zh-CN');
}

/** Format an ISO date string to a locale date+time (e.g. "2026-03-15 14:30"). */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return `${d.toLocaleDateString('en-CA')} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '—';
  }
}

/** Format seconds to a human-readable duration (e.g. "2m 30s"). */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds <= 0) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/** Truncate a UUID to its first 8 characters. */
export function truncateId(id: string | null | undefined): string {
  if (!id) return '—';
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

/** Mask an email for display (e.g. "u***@example.com"). */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '—';
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local.charAt(0)}***@${domain}`;
}

/** Build URLSearchParams for paginated API calls. */
export function buildPaginationParams(page: number, perPage: number): URLSearchParams {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  return params;
}
