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
      className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c4c6cf] bg-[#f4f4f0] px-8 shadow-sm"
    >
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2 text-stone-500 transition-colors hover:bg-[#ebe9df] md:hidden"
          aria-label={sidebarOpen ? '关闭侧边栏' : '打开侧边栏'}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="hidden md:block">
          <p className="font-serif text-lg font-bold tracking-tight text-[#002045]">
            StudySolo 后台
          </p>
          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-[#74777f]">
            <span className="h-1.5 w-1.5 animate-pulse bg-[#002045]" />
            管理协议在线
          </div>
        </div>

        <div className="hidden h-8 w-px bg-[#c4c6cf] md:block" />

        <label className="relative hidden sm:block">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
            search
          </span>
          <input
            className="w-72 border border-[#c4c6cf] bg-[#efeeea] py-2 pl-10 pr-4 font-mono text-sm text-[#002045] outline-none transition-colors placeholder:text-stone-400 focus:border-[#002045]"
            placeholder="搜索后台记录、用户或配置..."
            type="text"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center border border-[#c4c6cf] bg-[#f4f4f0] text-stone-500 transition-colors hover:bg-[#ebe9df] hover:text-[#002045]">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((current) => !current)}
            className="flex items-center gap-3 border border-[#c4c6cf] bg-[#f4f4f0] px-3 py-2 shadow-sm transition-colors hover:bg-[#ebe9df]"
            aria-label="打开管理员菜单"
          >
            <div className="flex h-9 w-9 items-center justify-center bg-[#002045] font-['Space_Grotesk'] text-sm font-semibold text-white">
              {getInitials(admin?.username)}
            </div>
            <div className="hidden text-left md:block">
              <p className="font-['Space_Grotesk'] text-sm font-semibold text-[#002045]">
                {adminLabel}
              </p>
              <p className="font-mono text-[10px] tracking-[0.16em] text-[#74777f]">
                管理员菜单
              </p>
            </div>
            <span className="material-symbols-outlined text-[#002045]">expand_more</span>
          </button>

          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-[calc(100%+10px)] w-72 border border-[#c4c6cf] bg-[#f4f4f0] p-4 shadow-sm"
              >
                <div className="border-b border-[#c4c6cf] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center bg-[#002045] font-['Space_Grotesk'] text-lg font-semibold text-white">
                      {getInitials(admin?.username)}
                    </div>
                    <div>
                      <p className="font-serif text-lg font-bold text-[#002045]">{adminLabel}</p>
                      <p className="font-mono text-[10px] tracking-[0.16em] text-[#74777f]">
                        管理员 ID · {admin?.id ?? '未载入'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 py-4">
                  <div className="border border-[#c4c6cf] bg-[#efeeea] px-3 py-3">
                    <p className="font-mono text-[10px] tracking-[0.16em] text-[#74777f]">
                      管理员状态
                    </p>
                    <p className="mt-2 text-sm text-[#002045]">
                      {admin?.force_change_password ? '当前账户需要修改密码' : '当前账户状态正常'}
                    </p>
                  </div>
                  <div className="border border-[#c4c6cf] bg-[#efeeea] px-3 py-3">
                    <p className="font-mono text-[10px] tracking-[0.16em] text-[#74777f]">
                      权限说明
                    </p>
                    <p className="mt-2 text-sm text-[#002045]">
                      系统管理员 · 可访问后台核心配置与审计模块
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push('/admin-analysis/change-password');
                    }}
                    className="border border-[#c4c6cf] bg-[#f4f4f0] px-4 py-2.5 font-['Space_Grotesk'] text-sm font-medium text-[#002045] transition-colors hover:bg-[#ebe9df]"
                  >
                    修改密码
                  </button>
                  <button
                    onClick={() => void logout()}
                    disabled={loggingOut}
                    className="border border-[#002045] bg-[#002045] px-4 py-2.5 font-['Space_Grotesk'] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
