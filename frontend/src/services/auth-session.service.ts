import { createClient } from '@/utils/supabase/client';

const API_BASE = '';
const SESSION_REFRESH_WINDOW_MS = 60_000;

type SessionPayload = {
  access_token: string;
  refresh_token: string;
  remember_me?: boolean;
};

let restorePromise: Promise<boolean> | null = null;

async function fetchAuth(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
  });
}

async function syncSessionTokens(payload: SessionPayload) {
  const response = await fetchAuth('/api/auth/sync-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.ok;
}

async function setBrowserSession(accessToken: string, refreshToken: string) {
  const supabase = createClient();
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

export async function refreshBackendSession() {
  const response = await fetchAuth('/api/auth/refresh', { method: 'POST' });
  if (!response.ok) {
    return false;
  }

  const data = (await response.json().catch(() => ({}))) as Partial<SessionPayload>;
  if (data.access_token && data.refresh_token) {
    await setBrowserSession(data.access_token, data.refresh_token);
  }

  return true;
}

export async function syncBrowserSessionToBackend(rememberMe = true) {
  const supabase = createClient();
  let session = (await supabase.auth.getSession()).data.session;

  if (!session) {
    return false;
  }

  const expiresAt = (session.expires_at ?? 0) * 1000;
  if (expiresAt && expiresAt <= Date.now() + SESSION_REFRESH_WINDOW_MS) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  }

  if (!session?.access_token || !session.refresh_token) {
    return false;
  }

  return syncSessionTokens({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    remember_me: rememberMe,
  });
}

export async function restoreAuthSession(rememberMe = true) {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!restorePromise) {
    restorePromise = (async () => {
      if (await refreshBackendSession()) {
        return true;
      }

      return syncBrowserSessionToBackend(rememberMe);
    })().finally(() => {
      restorePromise = null;
    });
  }

  return restorePromise;
}

export function subscribeToAuthSessionSync(rememberMe = true) {
  const supabase = createClient();
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (
      (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') &&
      session?.access_token &&
      session.refresh_token
    ) {
      void syncSessionTokens({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        remember_me: rememberMe,
      });
    }
  });

  return () => subscription.unsubscribe();
}
