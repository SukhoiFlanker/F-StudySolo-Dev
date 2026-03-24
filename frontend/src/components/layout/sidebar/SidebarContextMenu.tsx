'use client';

interface WorkflowContextMenuState {
  x: number;
  y: number;
  workflowId: string;
}

interface SidebarContextMenuProps {
  contextMenu: WorkflowContextMenuState;
  processingWorkflowId: string | null;
  onClose: () => void;
  onRename: (workflowId: string) => void;
  onDelete: (workflowId: string) => void;
}

export function SidebarContextMenu({
  contextMenu,
  processingWorkflowId,
  onClose,
  onRename,
  onDelete,
}: SidebarContextMenuProps) {
  const isProcessing = processingWorkflowId === contextMenu.workflowId;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-36 rounded-md border-2 border-stone-800 dark:border-stone-400 bg-stone-50 dark:bg-zinc-900 py-1.5 text-sm shadow-[3px_3px_0px_rgba(28,25,23,1)] dark:shadow-[3px_3px_0px_rgba(168,162,158,1)] node-paper-bg overflow-hidden"
        style={{ top: contextMenu.y, left: contextMenu.x }}
      >
        <button
          className="w-full px-4 py-1.5 text-left font-serif font-bold tracking-wide text-stone-800 dark:text-stone-200 transition-colors hover:bg-stone-200 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onRename(contextMenu.workflowId)}
          disabled={isProcessing}
        >
          重命名
        </button>
        <button
          className="w-full px-4 py-1.5 text-left font-serif font-bold tracking-wide text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-950/30 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onDelete(contextMenu.workflowId)}
          disabled={isProcessing}
        >
          {isProcessing ? '处理中...' : '删除'}
        </button>
      </div>
    </>
  );
}
