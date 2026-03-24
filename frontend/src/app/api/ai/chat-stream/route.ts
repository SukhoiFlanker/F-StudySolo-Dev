/**
 * SSE Streaming Proxy — Next.js App Router API Route.
 *
 * WHY: Next.js `rewrites()` in dev mode (Turbopack) uses an HTTP proxy that
 * buffers the entire response body before forwarding. This kills SSE streaming.
 *
 * This route.ts creates a native Web Streams proxy that passes through SSE
 * events byte-by-byte from the FastAPI backend to the browser, with zero buffering.
 *
 * The `rewrites()` in next.config.ts covers all OTHER /api/* paths.
 * App Router route files take priority over rewrites, so this file intercepts
 * only /api/ai/chat-stream while everything else continues through rewrites.
 */

import { type NextRequest } from 'next/server';

const BACKEND_URL = (
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://127.0.0.1:2038'
).replace(/\/+$/, '');

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Forward all relevant headers (auth cookies, content-type)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward cookies for auth (access_token)
  const cookie = req.headers.get('cookie');
  if (cookie) headers['Cookie'] = cookie;

  // Forward Authorization header if present
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/ai/chat-stream`, {
      method: 'POST',
      headers,
      body,
      signal: req.signal,
    });

    if (!backendRes.ok || !backendRes.body) {
      // Non-streaming error — forward as-is
      const errorBody = await backendRes.text();
      return new Response(errorBody, {
        status: backendRes.status,
        headers: { 'Content-Type': backendRes.headers.get('Content-Type') || 'application/json' },
      });
    }

    // Stream the SSE response through without buffering
    return new Response(backendRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Nginx: disable buffering
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return new Response(null, { status: 499 }); // Client closed
    }
    console.error('[SSE Proxy] Backend unreachable:', err);
    return new Response(
      JSON.stringify({ detail: '后端服务不可达' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
