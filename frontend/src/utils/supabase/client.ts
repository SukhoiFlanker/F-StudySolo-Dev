import { createBrowserClient } from '@supabase/ssr'

/** Global type augmentation for runtime env injection from root layout <script> */
declare global {
  interface Window {
    __ENV__?: Record<string, string>
  }
}

/**
 * Runtime env reader — reads from window.__ENV__ (injected by root layout
 * <script> tag on EVERY page load) to bypass Turbopack chunk-splitting
 * that can strip compile-time process.env replacements from some chunks.
 */
function getEnv(key: string): string {
  // 1st: runtime global (always available, injected server-side in <body>)
  if (typeof window !== 'undefined' && window.__ENV__) {
    const val = window.__ENV__[key]
    if (val) return val
  }
  // 2nd: compile-time replacement (may be missing in some chunks)
  const buildTime: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_COOKIE_DOMAIN: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  }
  return buildTime[key] ?? ''
}

/**
 * Singleton-cached browser Supabase client.
 * ⚠️ Returns `null` (instead of throwing) when env vars are missing.
 *    Callers MUST check for null or wrap in try-catch.
 */
let _cached: ReturnType<typeof createBrowserClient> | null = null
let _initFailed = false

export function createClient(): ReturnType<typeof createBrowserClient> | null {
  if (_cached) return _cached
  if (_initFailed) return null

  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const cookieDomain = getEnv('NEXT_PUBLIC_COOKIE_DOMAIN') || undefined

  if (!supabaseUrl || !supabaseAnonKey) {
    _initFailed = true
    console.error(
      `[StudySolo] ❌ Supabase env vars missing at runtime.\n` +
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗ EMPTY'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗ EMPTY'}\n` +
      `window.__ENV__: ${typeof window !== 'undefined' && window.__ENV__ ? JSON.stringify(Object.keys(window.__ENV__)) : '✗ NOT SET'}\n` +
      `Auth features will be unavailable until this is fixed.`
    )
    return null
  }

  try {
    _cached = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey,
      cookieDomain
        ? {
            cookieOptions: {
              domain: cookieDomain,
              path: '/',
              sameSite: 'lax' as const,
              secure: true,
            },
          }
        : undefined
    )
    return _cached
  } catch (err) {
    _initFailed = true
    console.error('[StudySolo] ❌ createBrowserClient threw:', err)
    return null
  }
}
