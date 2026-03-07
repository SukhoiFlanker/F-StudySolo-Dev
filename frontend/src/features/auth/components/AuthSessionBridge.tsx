'use client';

import { useEffect } from 'react';
import { initCrossTabSync } from '@/services/auth.service';
import {
  subscribeToAuthSessionSync,
  syncBrowserSessionToBackend,
} from '@/services/auth-session.service';

const AUTH_PAGES = new Set(['/login', '/register', '/forgot-password', '/reset-password']);

export function AuthSessionBridge() {
  useEffect(() => {
    void (async () => {
      const restored = await syncBrowserSessionToBackend();
      if (!restored || typeof window === 'undefined') {
        return;
      }

      if (!AUTH_PAGES.has(window.location.pathname)) {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      window.location.replace(next || '/workspace');
    })();

    const disposeCrossTabSync = initCrossTabSync();
    const disposeSessionSync = subscribeToAuthSessionSync();

    return () => {
      disposeCrossTabSync();
      disposeSessionSync();
    };
  }, []);

  return null;
}
