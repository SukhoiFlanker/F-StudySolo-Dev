import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const PROTECTED_ROUTES = ['/workspace', '/settings', '/history', '/profile']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

const TRUSTED_DOMAINS = [
  'studyflow.1037solo.com',
  'platform.1037solo.com',
]

function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

function isValidRedirectUrl(url: string): boolean {
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user } = await updateSession(request)

  // Protected routes: redirect to login if not authenticated
  if (isProtected(pathname) && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = `next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(loginUrl)
  }

  // Auth routes: redirect away if already authenticated
  if (isAuthRoute(pathname) && user) {
    const next = request.nextUrl.searchParams.get('next')
    let redirectTo = '/workspace'
    if (next) {
      // Support both relative paths and full URLs (for cross-project SSO)
      if (next.startsWith('/')) {
        redirectTo = next
      } else if (isValidRedirectUrl(next)) {
        return NextResponse.redirect(new URL(next))
      }
    }
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
