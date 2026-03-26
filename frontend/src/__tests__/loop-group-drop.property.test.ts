import { describe, expect, it } from 'vitest';
import type { Node } from '@xyflow/react';
import { applyLoopGroupDrop } from '@/features/workflow/utils/loop-group-drop';

function makeSummaryNode(id: string, position: { x: number; y: number }, parentId?: string): Node {
  return {
    id,
    type: 'summary',
    position,
    parentId,
    extent: parentId ? 'parent' : undefined,
    data: { label: id, system_prompt: '', model_route: '', status: 'pending', output: '' },
    measured: { width: 180, height: 120 },
  };
}

function makeLoopGroup(id: string, position = { x: 200, y: 100 }): Node {
  return {
    id,
    type: 'loop_group',
    position,
    data: { label: '循环块', maxIterations: 3, intervalSeconds: 0 },
    style: { width: 500, height: 350 },
    measured: { width: 500, height: 350 },
  };
}

describe('loop-group drop behavior', () => {
  it('reparents a node dropped inside a loop group', () => {
    const loopGroup = makeLoopGroup('loop-1');
    const node = makeSummaryNode('node-1', { x: 260, y: 190 });

    const result = applyLoopGroupDrop([loopGroup, node], 'node-1');
    const updated = result.find((item) => item.id === 'node-1');

    expect(updated?.parentId).toBe('loop-1');
    expect(updated?.extent).toBe('parent');
    expect(updated?.position.x).toBeGreaterThanOrEqual(16);
    expect(updated?.position.y).toBeGreaterThanOrEqual(44);
  });

  it('detaches a node dragged out of its loop group', () => {
    const loopGroup = makeLoopGroup('loop-1');
    const node = makeSummaryNode('node-1', { x: 620, y: 500 }, 'loop-1');

    const result = applyLoopGroupDrop([loopGroup, node], 'node-1');
    const updated = result.find((item) => item.id === 'node-1');

    expect(updated?.parentId).toBeUndefined();
    expect(updated?.extent).toBeUndefined();
    expect(updated?.position).toEqual({ x: 820, y: 600 });
  });
});
