import { create } from 'zustand';
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import type { Connection, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react';
import type { AIStepNodeData } from '@/types';

type NodeData = AIStepNodeData;

interface WorkflowStore {
  nodes: Node[];
  edges: Edge[];
  currentWorkflowId: string | null;
  selectedNodeId: string | null;
  lastPrompt: string;
  lastImplicitContext: Record<string, unknown> | null;
  isDirty: boolean;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateNodeData: (
    nodeId: string,
    data: Partial<NodeData> | ((prev: NodeData) => Partial<NodeData>)
  ) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  replaceWorkflowGraph: (nodes: Node[], edges: Edge[]) => void;
  setGenerationContext: (prompt: string, implicitContext: Record<string, unknown> | null) => void;
  setCurrentWorkflow: (id: string, nodes: Node[], edges: Edge[]) => void;
  markClean: () => void;
}

function resolveSelectedNodeId(nodes: Node[], selectedNodeId: string | null) {
  if (!nodes.length) {
    return null;
  }

  if (selectedNodeId && nodes.some((node) => node.id === selectedNodeId)) {
    return selectedNodeId;
  }

  return nodes[0]?.id ?? null;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  nodes: [],
  edges: [],
  currentWorkflowId: null,
  selectedNodeId: null,
  lastPrompt: '',
  lastImplicitContext: null,
  isDirty: false,

  setNodes: (nodes) =>
    set((state) => ({
      nodes,
      selectedNodeId: resolveSelectedNodeId(nodes, state.selectedNodeId),
      isDirty: true,
    })),

  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) =>
    set((state) => {
      const nextNodes = applyNodeChanges(changes, state.nodes);
      return {
        nodes: nextNodes,
        selectedNodeId: resolveSelectedNodeId(nextNodes, state.selectedNodeId),
        isDirty: true,
      };
    }),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: true,
    })),

  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          id: `edge-${connection.source ?? 'unknown'}-${connection.target ?? 'unknown'}-${state.edges.length + 1}`,
          type: 'default',
          animated: false,
        },
        state.edges
      ),
      isDirty: true,
    })),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id !== nodeId) return node;
        const prevData = node.data as unknown as NodeData;
        const patch = typeof data === 'function' ? data(prevData) : data;
        return { ...node, data: { ...prevData, ...patch } };
      }),
      isDirty: true,
    })),

  setSelectedNodeId: (selectedNodeId) =>
    set((state) => (state.selectedNodeId === selectedNodeId ? state : { selectedNodeId })),

  replaceWorkflowGraph: (nodes, edges) =>
    set((state) => ({
      nodes,
      edges,
      selectedNodeId: resolveSelectedNodeId(nodes, state.selectedNodeId),
      isDirty: true,
    })),

  setGenerationContext: (lastPrompt, lastImplicitContext) =>
    set({
      lastPrompt,
      lastImplicitContext,
    }),

  setCurrentWorkflow: (id, nodes, edges) =>
    set({
      currentWorkflowId: id,
      nodes,
      edges,
      selectedNodeId: resolveSelectedNodeId(nodes, null),
      isDirty: false,
    }),

  markClean: () => set({ isDirty: false }),
}));
