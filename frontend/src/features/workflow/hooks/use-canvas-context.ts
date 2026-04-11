'use client';

import { useCallback, useRef } from 'react';
import { useWorkflowStore } from '@/stores/workflow/use-workflow-store';
import type { NodeType } from '@/types';

type NodeDataLike = {
  label?: string;
  type?: NodeType;
  status?: string;
  output?: string;
};

/**
 * 节点摘要 — AI 可读格式.
 */
export interface NodeSummary {
  id: string;
  index: number;
  label: string;
  type: string;
  status: string;
  hasOutput: boolean;
  outputPreview: string;
  upstreamLabels: string[];
  downstreamLabels: string[];
  /** 节点画布坐标 — 供 AI MODIFY 操作计算新节点位置 */
  position: { x: number; y: number };
}

/**
 * 画布上下文快照 — 发送给后端 AI 做意图推理.
 */
export interface CanvasContext {
  workflowId: string | null;
  workflowName: string;
  nodesSummary: NodeSummary[];
  dagDescription: string;
  selectedNodeId: string | null;
  executionStatus: string | null;
  serializedAt: number;
}

/**
 * 画布上下文序列化 Hook.
 *
 * 读取 useWorkflowStore 的实时状态, 序列化为 AI 可理解的结构。
 * 设计为 Hook 而非 Store, 避免频繁序列化导致不必要渲染。
 */
export function useCanvasContext() {
  const cacheRef = useRef<CanvasContext | null>(null);
  const lastHashRef = useRef('');

  const serialize = useCallback((): CanvasContext => {
    const state = useWorkflowStore.getState();
    const { nodes, edges, currentWorkflowId, selectedNodeId } = state;

    // 简单哈希检测: 节点/边数量 + 选中节点未变则复用缓存
    const hash = `${nodes.length}-${edges.length}-${selectedNodeId}`;
    if (hash === lastHashRef.current && cacheRef.current) {
      return cacheRef.current;
    }

    // 构建节点 label 索引
    const labelById: Record<string, string> = {};
    for (const node of nodes) {
      const d = node.data as NodeDataLike;
      labelById[node.id] = d?.label || node.type || node.id;
    }

    // 构建连线关系
    const upstream: Record<string, string[]> = {};
    const downstream: Record<string, string[]> = {};
    for (const edge of edges) {
      if (!downstream[edge.source]) downstream[edge.source] = [];
      if (!upstream[edge.target]) upstream[edge.target] = [];
      downstream[edge.source].push(labelById[edge.target] || edge.target);
      upstream[edge.target].push(labelById[edge.source] || edge.source);
    }

    // 序列化节点摘要
    const nodesSummary: NodeSummary[] = nodes
      .filter((n) => n.type !== 'generating')
      .map((node, i) => {
        const d = node.data as NodeDataLike;
        const output = d?.output || '';
        return {
          id: node.id,
          index: i,
          label: d?.label || node.type || '',
          type: (d?.type as NodeType) || node.type || '',
          status: d?.status || 'pending',
          hasOutput: output.length > 0,
          outputPreview: output.slice(0, 100),
          upstreamLabels: upstream[node.id] || [],
          downstreamLabels: downstream[node.id] || [],
          position: { x: node.position?.x ?? 0, y: node.position?.y ?? 0 },
        };
      });

    // 构建 DAG 描述
    const dagParts: string[] = [];
    for (const edge of edges) {
      const src = labelById[edge.source] || edge.source;
      const dst = labelById[edge.target] || edge.target;
      dagParts.push(`${src} → ${dst}`);
    }

    const ctx: CanvasContext = {
      workflowId: currentWorkflowId,
      workflowName: '',
      nodesSummary,
      dagDescription: dagParts.join(', '),
      selectedNodeId,
      executionStatus: null,
      serializedAt: Date.now(),
    };

    cacheRef.current = ctx;
    lastHashRef.current = hash;
    return ctx;
  }, []);

  return { serialize };
}
