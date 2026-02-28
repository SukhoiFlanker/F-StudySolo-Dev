import Sidebar from '@/components/layout/Sidebar';
import type { WorkflowMeta } from '@/components/layout/Sidebar';
import DashboardShell from '@/components/layout/DashboardShell';
import RightPanel from '@/components/layout/RightPanel';
import { cookies } from 'next/headers';

async function fetchSidebarWorkflows(): Promise<WorkflowMeta[]> {
  const apiBase = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:2038';
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  try {
    const res = await fetch(`${apiBase}/api/workflow`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data: WorkflowMeta[] = await res.json();
    return data.map(({ id, name, updated_at }) => ({ id, name, updated_at }));
  } catch {
    return [];
  }
}

// Server Component — fetches workflow list for SSR via backend API
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workflows = await fetchSidebarWorkflows();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* DashboardShell (Client Component) wraps Navbar + MobileNav with onNewWorkflow */}
      <DashboardShell>
        {/* Body: sidebar + main canvas area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar — hidden on mobile */}
          <div className="hidden md:flex h-full">
            <Sidebar workflows={workflows} />
          </div>

          {/* Center canvas area */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>

          {/* Right panel — hidden on mobile */}
          <RightPanel />
        </div>
      </DashboardShell>
    </div>
  );
}
