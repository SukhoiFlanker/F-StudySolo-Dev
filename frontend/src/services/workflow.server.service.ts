import { cookies } from 'next/headers';
import {
  fetchPublicWorkflow,
  fetchWorkflowContent,
  fetchWorkflowList,
} from '@/services/workflow.service';
import type { WorkflowContent, WorkflowMeta, WorkflowPublicView } from '@/types/workflow';
import { buildApiUrl, buildAuthHeaders } from '@/services/api-client';

async function getAccessTokenFromCookieStore() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

export async function fetchWorkflowListForServer(): Promise<WorkflowMeta[]> {
  const token = await getAccessTokenFromCookieStore();
  return fetchWorkflowList(token, 30);
}

export async function fetchWorkflowContentForServer(
  workflowId: string
): Promise<WorkflowContent | null> {
  const token = await getAccessTokenFromCookieStore();
  return fetchWorkflowContent(workflowId, token);
}

export async function fetchPublicWorkflowForServer(
  workflowId: string
): Promise<WorkflowPublicView | null> {
  const token = await getAccessTokenFromCookieStore();
  return fetchPublicWorkflow(workflowId, token);
}

export interface UserWorkflowQuota {
  tier: string;
  workflows_used: number;
  workflows_base_limit: number;
  workflows_addon_qty: number;
  workflows_total: number;
  workflows_remaining: number;
}

export async function fetchUserQuotaForServer(): Promise<UserWorkflowQuota | null> {
  const token = await getAccessTokenFromCookieStore();
  if (!token) return null;
  try {
    const res = await fetch(buildApiUrl('/api/usage/quota'), {
      headers: buildAuthHeaders(token),
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json() as Promise<UserWorkflowQuota>;
  } catch {
    return null;
  }
}
