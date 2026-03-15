'use client';

import { useAdminSidebarNavigation } from '@/features/admin/hooks/use-admin-sidebar-navigation';
import { adminLogout } from '@/services/admin.service';

export function AdminTopbar() {
  const { sidebarOpen, toggleSidebar } = useAdminSidebarNavigation();

  async function handleLogout() {
    try {
      await adminLogout();
    } catch {
      /* allow failure */
    } finally {
      window.location.href = '/admin-analysis/login';
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#0A0E1A] px-4">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white md:hidden"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      <button
        onClick={() => void handleLogout()}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
      >
        Logout
      </button>
    </header>
  );
}
