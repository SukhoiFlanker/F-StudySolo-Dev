const TRUSTED_DOMAINS = [
  'studyflow.1037solo.com',
  'platform.1037solo.com',
]

export function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      TRUSTED_DOMAINS.some(
        (d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
      )
    )
  } catch {
    return false
  }
}

export function getSafeRedirectUrl(
  next: string | null,
  fallback = '/'
): string {
  if (!next) return fallback
  if (next.startsWith('/')) return next
  return isValidRedirectUrl(next) ? next : fallback
}
