'use client';

import { useEffect, useState, useCallback } from 'react';
import { Mail, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchPendingInvitations,
  acceptInvitation,
  rejectInvitation,
  type Invitation,
} from '@/services/collaboration.service';

/**
 * InvitationList — pending invitation notifications in the sidebar.
 * Shows a badge count and allows accept/reject inline.
 */
export default function InvitationList() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPendingInvitations();
      setInvitations(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAccept(id: string) {
    try {
      await acceptInvitation(id);
      toast.success('已接受邀请');
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectInvitation(id);
      toast.success('已拒绝邀请');
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    }
  }

  if (loading || invitations.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-serif font-medium text-muted-foreground mb-2">
        <Mail className="h-3.5 w-3.5" />
        <span>待处理邀请</span>
        <span className="ml-auto text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
          {invitations.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="rounded-lg border border-amber-200/50 bg-amber-50/30 p-2"
          >
            <p className="text-xs font-medium truncate">
              {inv.workflow_name || '未知工作流'}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {inv.inviter_name} 邀请你为{inv.role === 'editor' ? '编辑者' : '查看者'}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                onClick={() => handleAccept(inv.id)}
                className="flex items-center gap-0.5 rounded-md bg-foreground text-background px-2 py-1 text-[10px] font-medium hover:opacity-90 transition-opacity"
              >
                <Check className="h-3 w-3" />
                接受
              </button>
              <button
                onClick={() => handleReject(inv.id)}
                className="flex items-center gap-0.5 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3" />
                拒绝
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
