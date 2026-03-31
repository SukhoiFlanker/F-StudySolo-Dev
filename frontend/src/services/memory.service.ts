/**
 * Memory service — client-side API calls for Workflow Memory.
 */

import { authedFetch } from '@/services/api-client';
import type { WorkflowRunDetail, WorkflowRunMeta } from '@/types/memory';

export async function fetchWorkflowRuns(
  workflowId: string,
  limit = 20,
  offset = 0,
): Promise<WorkflowRunMeta[]> {
  const res = await authedFetch(
    `/api/workflow-runs/by-workflow/${workflowId}?limit=${limit}&offset=${offset}`,
  );
  if (!res.ok) return [];
  return res.json() as Promise<WorkflowRunMeta[]>;
}

export async function fetchAllRuns(
  limit = 30,
  offset = 0,
): Promise<WorkflowRunMeta[]> {
  const res = await authedFetch(
    `/api/workflow-runs/all?limit=${limit}&offset=${offset}`,
  );
  if (!res.ok) return [];
  return res.json() as Promise<WorkflowRunMeta[]>;
}

export async function fetchRunDetail(
  runId: string,
): Promise<WorkflowRunDetail | null> {
  const res = await authedFetch(`/api/workflow-runs/${runId}`);
  if (!res.ok) return null;
  return res.json() as Promise<WorkflowRunDetail>;
}

export async function toggleRunShare(
  runId: string,
): Promise<{ is_shared: boolean; run_id: string } | null> {
  const res = await authedFetch(`/api/workflow-runs/${runId}/share`, {
    method: 'POST',
  });
  if (!res.ok) return null;
  return res.json();
}
