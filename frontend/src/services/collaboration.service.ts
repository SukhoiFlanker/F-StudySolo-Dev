import { parseApiError } from '@/services/api-client';

/* ── Types ─────────────────────────────────────────────── */

export interface Collaborator {
  id: string;
  user_id: string;
  nickname: string | null;
  email: string | null;
  role: string;
  status: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  workflow_id: string;
  workflow_name: string | null;
  inviter_name: string | null;
  role: string;
  status: string;
  created_at: string;
}

export interface SharedWorkflowItem {
  id: string;
  name: string;
  description: string | null;
  owner_name: string | null;
  my_role: string;
  tags: string[];
  updated_at: string;
}

/* ── Collaborator management (owner) ───────────────────── */

export async function inviteCollaborator(
  workflowId: string,
  email: string,
  role: string = 'editor'
): Promise<void> {
  const res = await fetch(`/api/workflow/${workflowId}/collaborators`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, '邀请失败'));
  }
}

export async function fetchCollaborators(
  workflowId: string
): Promise<Collaborator[]> {
  const res = await fetch(`/api/workflow/${workflowId}/collaborators`, {
    credentials: 'include',
  });
  if (!res.ok) return [];
  return (await res.json()) as Collaborator[];
}

export async function removeCollaborator(
  workflowId: string,
  userId: string
): Promise<void> {
  const res = await fetch(
    `/api/workflow/${workflowId}/collaborators/${userId}`,
    { method: 'DELETE', credentials: 'include' }
  );
  if (!res.ok) {
    throw new Error(await parseApiError(res, '移除失败'));
  }
}

/* ── Invitations (invitee) ─────────────────────────────── */

export async function fetchPendingInvitations(): Promise<Invitation[]> {
  const res = await fetch('/api/workflow/invitations', {
    credentials: 'include',
  });
  if (!res.ok) return [];
  return (await res.json()) as Invitation[];
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  const res = await fetch(
    `/api/workflow/invitations/${invitationId}/accept`,
    { method: 'POST', credentials: 'include' }
  );
  if (!res.ok) {
    throw new Error(await parseApiError(res, '接受邀请失败'));
  }
}

export async function rejectInvitation(invitationId: string): Promise<void> {
  const res = await fetch(
    `/api/workflow/invitations/${invitationId}/reject`,
    { method: 'POST', credentials: 'include' }
  );
  if (!res.ok) {
    throw new Error(await parseApiError(res, '拒绝邀请失败'));
  }
}

/* ── Shared workspace ──────────────────────────────────── */

export async function fetchSharedWorkflows(): Promise<SharedWorkflowItem[]> {
  const res = await fetch('/api/workflow/shared', {
    credentials: 'include',
  });
  if (!res.ok) return [];
  return (await res.json()) as SharedWorkflowItem[];
}
