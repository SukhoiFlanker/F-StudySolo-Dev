'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePanelStore } from '@/stores/ui/use-panel-store';

/**
 * /settings route now redirects back to workspace and opens the
 * settings panel in the sidebar instead of a full-page view.
 */
export default function SettingsPage() {
  const router = useRouter();
  const setActiveSidebarPanel = usePanelStore((s) => s.setActiveSidebarPanel);

  useEffect(() => {
    setActiveSidebarPanel('settings');
    router.replace('/workspace');
  }, [router, setActiveSidebarPanel]);

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-muted-foreground">正在跳转到设置面板...</p>
    </div>
  );
}
