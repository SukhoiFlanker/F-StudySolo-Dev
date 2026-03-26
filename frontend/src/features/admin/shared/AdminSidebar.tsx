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
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={closeSidebarOnMobileNavigate}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#c4c6cf] bg-[#f4f4f0] shadow-sm transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-[#c4c6cf] px-8 py-6">
          <h1 className="font-serif text-2xl font-black tracking-tight text-[#002045]">StudySolo</h1>
          <p className="mt-1 font-mono text-[10px] tracking-[0.24em] text-[#74777f]">
            后台管理面板
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
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
                  className={`group relative flex items-center gap-3 border-l-4 px-4 py-3 transition-all ${
                    active
                      ? 'border-[#002045] bg-[#ebe9df] text-[#002045]'
                      : 'border-transparent text-stone-500 hover:bg-[#efeeea] hover:text-[#002045]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className={active ? 'font-serif text-sm font-bold tracking-wide' : 'text-sm'}>
                    {item.label}
                  </span>
                  {active ? (
                    <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 bg-[#002045]" />
                  ) : null}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="border-t border-[#c4c6cf] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#002045] font-mono text-xs font-bold text-white shadow-sm">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-[#002045]">管理员资料</p>
              <p className="font-mono text-[10px] tracking-[0.14em] text-[#74777f]">
                当前会话在线
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
