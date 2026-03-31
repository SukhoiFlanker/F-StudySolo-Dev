import '@/app/globals.css';
import SessionRefresher from '@/app/s/[id]/SessionRefresher';

export default function MemoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-screen bg-background">
      {/* Reuse Supabase session refresh outside dashboard layout */}
      <SessionRefresher />

      {/* Floating minimalist top bar */}
      <header className="sticky top-0 z-50 px-4 py-3 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <a
            href="/workspace"
            className="flex items-center gap-2 rounded-md bg-background/80 backdrop-blur-md px-3 py-1.5 border border-border/50 text-sm font-serif font-semibold text-foreground shadow-sm hover:bg-background/90 transition-all group"
            title="返回工作台"
          >
            ← <span className="group-hover:opacity-80 transition-opacity">StudySolo</span>
          </a>
          <div className="rounded-md bg-background/80 backdrop-blur-md px-3 py-1.5 border border-border/50 text-xs text-muted-foreground shadow-sm font-serif">
            运行记忆 · Memory View
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
