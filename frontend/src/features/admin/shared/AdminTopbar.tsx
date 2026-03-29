'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAdminLogoutAction } from '@/features/admin/hooks/use-admin-logout-action';
import { useAdminSidebarNavigation } from '@/features/admin/hooks/use-admin-sidebar-navigation';
import { useAdminStore } from '@/stores/use-admin-store';

function getInitials(username: string | undefined) {
  if (!username) {
    return 'AD';
  }
  return username.slice(0, 2).toUpperCase();
}

export function AdminTopbar() {
  const router = useRouter();
  const admin = useAdminStore((state) => state.admin);
  const { sidebarOpen, toggleSidebar } = useAdminSidebarNavigation();
  const { logout, loggingOut } = useAdminLogoutAction();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const adminLabel = useMemo(() => admin?.username ?? '管理员', [admin?.username]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-8 shadow-sm backdrop-blur-md"
    >
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label={sidebarOpen ? '关闭侧边栏' : '打开侧边栏'}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="hidden md:block">
          <p className="font-semibold tracking-tight text-slate-900">
            StudySolo 后台
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            ADMIN PROTOCOL ONLINE
          </div>
        </div>

        <div className="hidden h-6 w-px bg-slate-200 md:block" />

        <label className="relative hidden w-80 sm:block group">
          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 transition-colors group-focus-within:text-indigo-500">
            search
          </span>
          <input
            className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            placeholder="搜索后台记录、用户或配置..."
            type="text"
          />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-[38px] items-center gap-2.5 rounded-full border border-slate-200 bg-white pl-1 pr-3 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="打开管理员菜单"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm ring-1 ring-inset ring-indigo-500/20">
              {getInitials(admin?.username)}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-slate-700">
                {adminLabel}
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
          </button>

          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-[calc(100%+12px)] w-72 transform-origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5"
              >
                <div className="border-b border-slate-100 bg-slate-50/50 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm ring-1 ring-inset ring-indigo-500">
                      {getInitials(admin?.username)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="truncate text-base font-bold text-slate-900">{adminLabel}</p>
                      <p className="truncate text-xs text-slate-500">
                        ID: {admin?.id ? admin.id.slice(0, 8) + '...' : '未载入'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <div className="space-y-1">
                    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        安全状态
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        {admin?.force_change_password ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            需要修改密码
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            账户状态正常
                          </>
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        权限层级
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        System Administrator
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/50 p-3 space-y-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push('/admin-analysis/change-password');
                    }}
                    className="flex w-full justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    修改密码
                  </button>
                  <button
                    onClick={() => void logout()}
                    disabled={loggingOut}
                    className="flex w-full justify-center rounded-lg border border-transparent bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {loggingOut ? '退出中...' : '退出登录'}
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
