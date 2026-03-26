'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Users } from 'lucide-react';
import { fetchSharedWorkflows, type SharedWorkflowItem } from '@/services/collaboration.service';

/**
 * SharedWorkflowsPanel — shows workflows shared with the current user.
 * Appears in the sidebar under "协作空间" section.
 */
export default function SharedWorkflowsPanel() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<SharedWorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSharedWorkflows();
      setWorkflows(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>协作空间</span>
        </div>
        <div className="mt-2 h-8 animate-pulse rounded bg-muted/50" />
      </div>
    );
  }

  if (workflows.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-serif font-medium text-muted-foreground mb-2">
        <Users className="h-3.5 w-3.5" />
        <span>协作空间</span>
        <span className="ml-auto text-[9px] bg-muted px-1.5 py-0.5 rounded-full">
          {workflows.length}
        </span>
      </div>

      <div className="space-y-1">
        {workflows.map((wf) => (
          <button
            key={wf.id}
            type="button"
            onClick={() => router.push(`/c/${wf.id}`)}
            className="node-paper-bg group flex w-full items-center gap-2 rounded-lg border border-border/30 px-2.5 py-2 text-left hover:bg-muted/50 transition-colors"
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{wf.name}</p>
              <p className="text-[9px] text-muted-foreground truncate">
                by {wf.owner_name} · {wf.my_role === 'editor' ? '可编辑' : '仅查看'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
