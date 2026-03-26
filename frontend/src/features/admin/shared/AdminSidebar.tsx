'use client';

import Link from 'next/link';
import { useAdminSidebarNavigation } from '@/features/admin/hooks/use-admin-sidebar-navigation';

export const ADMIN_NAV_ITEMS = [
  { href: '/admin-analysis', label: '数据概览', icon: 'dashboard' },
  { href: '/admin-analysis/users', label: '用户管理', icon: 'group' },
  { href: '/admin-analysis/workflows', label: '工作流监控', icon: 'account_tree' },
  { href: '/admin-analysis/members', label: '会员管理', icon: 'workspace_premium' },
  { href: '/admin-analysis/ratings', label: '评分数据', icon: 'star' },
  { href: '/admin-analysis/notices', label: '公告管理', icon: 'campaign' },
  { href: '/admin-analysis/models', label: '模型配置', icon: 'neurology' },
  { href: '/admin-analysis/audit', label: '审计日志', icon: 'receipt_long' },
  { href: '/admin-analysis/config', label: '系统设置', icon: 'settings' },
];

export function AdminSidebar() {
  const { sidebarOpen, isActive, closeSidebarOnMobileNavigate } =
    useAdminSidebarNavigation();

  return (
    <>
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={closeSidebarOnMobileNavigate}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#c4c6cf] bg-[#f4f4f0] shadow-sm transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-2 px-8 py-6">
          <h1 className="font-serif text-2xl font-black tracking-tight text-[#002045]">
            StudySolo
          </h1>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.2em] text-stone-500">
            后台管理面板
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-4">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebarOnMobileNavigate}
                className={`flex items-center gap-3 border-l-4 px-4 py-3 transition-all ${
                  active
                    ? 'border-[#002045] bg-[#ebe9df] font-bold text-[#002045]'
                    : 'border-transparent font-mono text-xs text-stone-500 hover:text-[#002045]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className={active ? 'font-serif text-sm tracking-wide' : 'text-xs'}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-200/60 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-[#002045] text-xs font-bold text-white shadow-sm">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-bold text-stone-700">管理员资料</p>
              <p className="font-mono text-[10px] tracking-tight text-stone-400">
                系统管理员
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
