'use client';

import Link from 'next/link';
import { useAdminSidebarNavigation } from '@/features/admin/hooks/use-admin-sidebar-navigation';

const NAV_ITEMS = [
  { href: '/admin-analysis', label: 'Dashboard', icon: '📊' },
  { href: '/admin-analysis/users', label: 'Users', icon: '👥' },
  { href: '/admin-analysis/workflows', label: 'Workflows', icon: '⚡' },
  { href: '/admin-analysis/notices', label: 'Notices', icon: '📢' },
  { href: '/admin-analysis/ratings', label: 'Ratings', icon: '⭐' },
  { href: '/admin-analysis/members', label: 'Members', icon: '🔑' },
  { href: '/admin-analysis/models', label: 'Models', icon: '🤖' },
  { href: '/admin-analysis/config', label: 'Config', icon: '⚙️' },
  { href: '/admin-analysis/audit', label: 'Audit Log', icon: '📋' },
];

export function AdminSidebar() {
  const { pathname, sidebarOpen, isActive, closeSidebarOnMobileNavigate } =
    useAdminSidebarNavigation();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={closeSidebarOnMobileNavigate}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-white/10 bg-[#0A0E1A] transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center gap-2 border-b border-white/10 px-5">
          <span className="text-lg font-bold text-white">Admin</span>
          <span className="text-xs text-white/30">Panel</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeSidebarOnMobileNavigate}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
