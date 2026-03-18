'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Pencil, ArrowLeftRight, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '@/stores/use-workflow-store';

interface EdgeContextMenuProps {
  x: number;
  y: number;
  edgeId: string;
  onClose: () => void;
}

export default function EdgeContextMenu({ x, y, edgeId, onClose }: EdgeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const getEdge = useCallback(() => {
    return useWorkflowStore.getState().edges.find((e) => e.id === edgeId);
  }, [edgeId]);

  const handleEditNote = useCallback(() => {
    const edge = getEdge();
    if (!edge) return;
    const currentNote = ((edge.data as Record<string, unknown>)?.note as string) || '';
    const newNote = prompt('编辑备注:', currentNote);
    if (newNote !== null) {
      const edges = useWorkflowStore.getState().edges;
      useWorkflowStore.getState().takeSnapshot();
      useWorkflowStore.getState().setEdges(
        edges.map((e) =>
          e.id === edgeId
            ? { ...e, data: { ...((e.data || {}) as Record<string, unknown>), note: newNote } }
            : e
        )
      );
    }
    onClose();
  }, [edgeId, getEdge, onClose]);

  const handleReverse = useCallback(() => {
    const reverseHandleMap: Record<string, string> = {
      'source-right': 'target-left',
      'source-bottom': 'target-top',
      'target-left': 'source-right',
      'target-top': 'source-bottom',
    };

    const edges = useWorkflowStore.getState().edges;
    useWorkflowStore.getState().takeSnapshot();
    useWorkflowStore.getState().setEdges(
      edges.map((e) => {
        if (e.id !== edgeId) return e;
        return {
          ...e,
          source: e.target,
          target: e.source,
          sourceHandle: reverseHandleMap[e.targetHandle ?? ''] ?? 'source-right',
          targetHandle: reverseHandleMap[e.sourceHandle ?? ''] ?? 'target-left',
        };
      })
    );
    onClose();
  }, [edgeId, onClose]);

  const handleDelete = useCallback(() => {
    useWorkflowStore.getState().takeSnapshot();
    const edges = useWorkflowStore.getState().edges;
    useWorkflowStore.getState().setEdges(edges.filter((e) => e.id !== edgeId));
    onClose();
  }, [edgeId, onClose]);

  return (
    <div
      ref={menuRef}
      className="canvas-context-menu"
      style={{
        left: x,
        top: y,
        position: 'fixed',
        zIndex: 1000,
      }}
    >
      {/* Edit note */}
      <button className="canvas-context-menu-item" onClick={handleEditNote}>
        <Pencil size={13} className="canvas-context-menu-icon" />
        <span>编辑备注</span>
        <span className="canvas-context-menu-shortcut">双击</span>
      </button>

      <div className="canvas-context-menu-divider" />

      {/* Reverse direction */}
      <button className="canvas-context-menu-item" onClick={handleReverse}>
        <ArrowLeftRight size={13} className="canvas-context-menu-icon" />
        <span>反转方向</span>
      </button>

      {/* Delete */}
      <button
        className="canvas-context-menu-item canvas-context-menu-item-danger"
        onClick={handleDelete}
      >
        <Trash2 size={13} className="canvas-context-menu-icon" />
        <span>删除连线</span>
        <span className="canvas-context-menu-shortcut">DEL</span>
      </button>
    </div>
  );
}
