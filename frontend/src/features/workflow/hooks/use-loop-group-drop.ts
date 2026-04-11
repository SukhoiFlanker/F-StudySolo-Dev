'use client';

import { useCallback } from 'react';
import type { Node } from '@xyflow/react';
import { useWorkflowStore } from '@/stores/workflow/use-workflow-store';
import { applyLoopGroupDrop } from '@/features/workflow/utils/loop-group-drop';

export function useLoopGroupDrop() {
  return useCallback((_event: React.MouseEvent, draggedNode: Node) => {
    const store = useWorkflowStore.getState();
    const nextNodes = applyLoopGroupDrop(store.nodes, draggedNode.id);
    if (nextNodes === store.nodes) {
      return;
    }

    const hasChanged = nextNodes.some((node, index) => node !== store.nodes[index]);
    if (!hasChanged) {
      return;
    }

    store.takeSnapshot();
    store.setNodes(nextNodes);
  }, []);
}
