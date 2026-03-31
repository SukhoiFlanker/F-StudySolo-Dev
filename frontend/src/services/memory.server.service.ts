/**
 * Memory server service — server-side data fetching for m/[id] route.
 */

import { cookies } from 'next/headers';
import { buildApiUrl, buildAuthHeaders } from '@/services/api-client';
import type { WorkflowRunDetail } from '@/types/memory';

async function getAccessTokenFromCookieStore() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

/**
 * Fetch a run's detail for rendering in the m/[id] Server Component.
 *
 * Access logic:
 * 1. If user has a token → try authenticated endpoint (owner access)
 * 2. If no token or authed attempt fails → try public endpoint (shared access)
 * 3. Returns null if both fail → page.tsx shows notFound()
 */
export async function fetchRunForServer(
  runId: string,
): Promise<WorkflowRunDetail | null> {
  const token = getAccessTokenFromCookieStore();

  // Try authenticated access first (owner can always see their own runs)
  const resolvedToken = await token;
  if (resolvedToken) {
    try {
      const res = await fetch(buildApiUrl(`/api/workflow-runs/${runId}`), {
        headers: buildAuthHeaders(resolvedToken),
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        return res.json() as Promise<WorkflowRunDetail>;
      }
    } catch {
      // Fall through to public access
    }
  }

  // Fallback: try public access (for shared runs)
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (resolvedToken) {
      headers.Authorization = `Bearer ${resolvedToken}`;
    }
    const res = await fetch(buildApiUrl(`/api/workflow-runs/${runId}/public`), {
      headers,
      cache: 'no-store',
    });
    if (res.ok) {
      return res.json() as Promise<WorkflowRunDetail>;
    }
  } catch {
    // Both attempts failed
  }

  return null;
}
