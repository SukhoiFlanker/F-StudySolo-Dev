import type { WorkflowEdgeData } from '@/types';

export interface EdgeDisplayState {
  primaryLabel: string;
  waitLabel: string | null;
}

export function normalizeWaitSeconds(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(300, Number(value.toFixed(1))));
}

export function formatWaitSeconds(value: number) {
  const normalized = normalizeWaitSeconds(value);
  return Number.isInteger(normalized) ? String(normalized) : normalized.toFixed(1);
}

export function buildEdgeDisplayState(
  edgeData: WorkflowEdgeData | undefined,
  isBranchEdge: boolean,
): EdgeDisplayState {
  const primaryLabel = isBranchEdge
    ? edgeData?.branch?.trim() || '默认'
    : edgeData?.note?.trim() || '';
  const waitSeconds = normalizeWaitSeconds(edgeData?.waitSeconds);

  return {
    primaryLabel,
    waitLabel: waitSeconds > 0 ? `⏱ ${formatWaitSeconds(waitSeconds)}s` : null,
  };
}
