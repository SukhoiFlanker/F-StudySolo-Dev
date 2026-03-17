'use client';

import { useState, useCallback } from 'react';
import {
  MousePointer2,
  Pencil,
  Hand,
  Search,
  Smile,
  ImagePlus,
  Play,
  Square,
} from 'lucide-react';
import { useWorkflowExecution } from '@/features/workflow/hooks/use-workflow-execution';
import { useWorkflowStore } from '@/stores/use-workflow-store';

type CanvasTool = 'select' | 'edit' | 'pan' | 'search';

interface FloatingToolbarProps {
  className?: string;
}

/**
 * Floating toolbar at bottom-center of the canvas.
 * Mirrors the reference design: cursor, edit, hand, search, emoji, upload
 * Plus integrated run/stop control.
 */
export default function FloatingToolbar({ className = '' }: FloatingToolbarProps) {
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');
  const { status, start, stop } = useWorkflowExecution();
  const nodes = useWorkflowStore((s) => s.nodes);
  const hasNodes = nodes.length > 0;
  const isRunning = status === 'running';

  const handleToolChange = useCallback((tool: CanvasTool) => {
    setActiveTool(tool);

    // Dispatch custom event for canvas to change interaction mode
    window.dispatchEvent(
      new CustomEvent('canvas:tool-change', { detail: { tool } })
    );
  }, []);

  const handleUpload = useCallback(() => {
    // Dispatch file upload trigger
    window.dispatchEvent(new CustomEvent('canvas:upload-file'));
  }, []);

  const handleEmoji = useCallback(() => {
    // Placeholder for emoji/annotation picker
    window.dispatchEvent(new CustomEvent('canvas:add-annotation'));
  }, []);

  return (
    <div className={`canvas-floating-toolbar ${className}`}>
      {/* Tool group */}
      <button
        type="button"
        className={activeTool === 'select' ? 'active' : ''}
        onClick={() => handleToolChange('select')}
        title="选择工具 (V)"
      >
        <MousePointer2 className="h-[18px] w-[18px]" />
      </button>

      <button
        type="button"
        className={activeTool === 'edit' ? 'active' : ''}
        onClick={() => handleToolChange('edit')}
        title="编辑工具 (E)"
      >
        <Pencil className="h-[18px] w-[18px]" />
      </button>

      <button
        type="button"
        className={activeTool === 'pan' ? 'active' : ''}
        onClick={() => handleToolChange('pan')}
        title="平移工具 (H)"
      >
        <Hand className="h-[18px] w-[18px]" />
      </button>

      <button
        type="button"
        className={activeTool === 'search' ? 'active' : ''}
        onClick={() => handleToolChange('search')}
        title="搜索节点 (F)"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>

      <div className="toolbar-divider" />

      {/* Action group */}
      <button
        type="button"
        onClick={handleEmoji}
        title="添加标注"
      >
        <Smile className="h-[18px] w-[18px]" />
      </button>

      <button
        type="button"
        onClick={handleUpload}
        title="上传文件到画布"
      >
        <ImagePlus className="h-[18px] w-[18px]" />
      </button>

      <div className="toolbar-divider" />

      {/* Run/Stop */}
      {isRunning ? (
        <button
          type="button"
          onClick={stop}
          className="!text-rose-400"
          title="停止运行"
        >
          <Square className="h-4 w-4 fill-current" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => start()}
          disabled={!hasNodes}
          className={hasNodes ? '!text-emerald-400' : '!text-muted-foreground/30 !cursor-not-allowed'}
          title="运行全部"
        >
          <Play className="h-4 w-4 fill-current" />
        </button>
      )}
    </div>
  );
}
