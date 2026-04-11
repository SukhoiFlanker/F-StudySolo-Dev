'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAdminStore } from '@/stores/admin/use-admin-store';
import { ADMIN_NAV_ITEMS } from './AdminSidebar';

function resolvePageMeta(pathname: string) {
  const match = ADMIN_NAV_ITEMS.find((item) => {
    if (item.href === '/admin-analysis') return pathname === '/admin-analysis';
    return pathname.startsWith(item.href);
  });
  return match ?? { label: '后台', icon: 'dashboard' };
}

export function AdminTopbar() {
  const pathname = usePathname();
  const admin = useAdminStore((state) => state.admin);
  const page = useMemo(() => resolvePageMeta(pathname), [pathname]);

  return (
    <header className="flex h-11 w-full shrink-0 items-center justify-between border-b border-border bg-card px-5">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="font-medium text-muted-foreground">管理后台</span>
        <span className="text-border">/</span>
        <span className="font-medium text-foreground">{page.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[11px] font-medium text-muted-foreground">{admin?.username ?? '管理员'}</span>
        </div>
      </div>
    </header>
  );
}
