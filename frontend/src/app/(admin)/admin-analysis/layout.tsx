'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar, AdminTopbar } from '@/features/admin/shared';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin-analysis/login';

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;600&family=Space+Grotesk:wght@300;400;700&display=swap"
        rel="stylesheet"
      />

      {isLoginPage ? (
        children
      ) : (
        <div className="flex h-screen overflow-hidden bg-[#f4f4f0] font-[Work_Sans,sans-serif] text-[#1b1c1a]">
          <AdminSidebar />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <AdminTopbar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      )}
    </>
  );
}
