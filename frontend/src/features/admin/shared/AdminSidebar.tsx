'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={closeSidebarOnMobileNavigate}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-slate-50 shadow-sm transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-200 px-8 py-6 bg-white/50">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">StudySolo</h1>
          <p className="mt-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Admin Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          {ADMIN_NAV_ITEMS.map((item, index) => {
            const active = isActive(item.href);
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.22, ease: 'easeOut' }}
              >
                <Link
                  href={item.href}
                  onClick={closeSidebarOnMobileNavigate}
                  className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </span>
                  <span className={active ? 'text-sm font-semibold' : 'text-sm font-medium'}>
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-6 py-6 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm ring-1 ring-inset ring-indigo-500">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold text-slate-900">管理员在线</p>
              <p className="w-full truncate text-[11px] font-medium text-slate-500">
                System Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
