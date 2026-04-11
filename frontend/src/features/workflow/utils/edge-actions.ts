import { useWorkflowStore } from '@/stores/workflow/use-workflow-store';
import type { Edge } from '@xyflow/react';
import type { WorkflowEdgeData } from '@/types';

const REVERSE_HANDLE_MAP: Record<string, string> = {
  'source-right': 'target-left',
  'source-bottom': 'target-top',
  'target-left': 'source-right',
  'target-top': 'source-bottom',
};

function updateEdgeState(
  edgeId: string,
  updater: (prevData: WorkflowEdgeData) => { data?: WorkflowEdgeData; source?: string; target?: string; sourceHandle?: string; targetHandle?: string } | null,
) {
  const store = useWorkflowStore.getState();
  const targetEdge = store.edges.find((edge) => edge.id === edgeId);
  if (!targetEdge) {
    return;
  }

  const next = updater((targetEdge.data || {}) as WorkflowEdgeData);
  if (!next) {
    return;
  }

  store.takeSnapshot();
  store.setEdges(
    store.edges.map((edge) =>
      edge.id === edgeId
        ? {
            ...edge,
            ...('source' in next ? { source: next.source } : {}),
            ...('target' in next ? { target: next.target } : {}),
            ...('sourceHandle' in next ? { sourceHandle: next.sourceHandle } : {}),
            ...('targetHandle' in next ? { targetHandle: next.targetHandle } : {}),
            ...(next.data ? { data: next.data as Edge['data'] } : {}),
          }
        : edge,
    ) as Edge[],
  );
}

export function updateEdgeData(
  edgeId: string,
  patch: Partial<WorkflowEdgeData> | ((prev: WorkflowEdgeData) => Partial<WorkflowEdgeData>),
) {
  updateEdgeState(edgeId, (prevData) => {
    const partial = typeof patch === 'function' ? patch(prevData) : patch;
    return { data: { ...prevData, ...partial } };
  });
}

export function updateEdgeNote(edgeId: string, note: string) {
  updateEdgeData(edgeId, { note });
}

export function updateEdgeBranch(edgeId: string, branch: string) {
  updateEdgeData(edgeId, { branch });
}

export function updateEdgeWaitSeconds(edgeId: string, waitSeconds: number) {
  updateEdgeData(edgeId, { waitSeconds });
}

export function reverseEdge(edgeId: string) {
  const store = useWorkflowStore.getState();
  const edge = store.edges.find((item) => item.id === edgeId);
  if (!edge) {
    return;
  }

  updateEdgeState(edgeId, (prevData) => ({
    source: edge.target,
    target: edge.source,
    sourceHandle: REVERSE_HANDLE_MAP[edge.targetHandle ?? ''] ?? 'source-right',
    targetHandle: REVERSE_HANDLE_MAP[edge.sourceHandle ?? ''] ?? 'target-left',
    data: prevData,
  }));
}

export function deleteEdge(edgeId: string) {
  const store = useWorkflowStore.getState();
  if (!store.edges.some((edge) => edge.id === edgeId)) {
    return;
  }
  store.takeSnapshot();
  store.setEdges(store.edges.filter((edge) => edge.id !== edgeId));
}
