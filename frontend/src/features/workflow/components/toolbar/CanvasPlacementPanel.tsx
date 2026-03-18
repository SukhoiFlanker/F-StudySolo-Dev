'use client';

import { memo, useCallback } from 'react';
import { X, ArrowRight, GitBranch, Repeat } from 'lucide-react';

/** 画布放置模式 */
export type PlacementMode = 'connect' | 'logic_switch' | 'loop_group';

interface CanvasPlacementPanelProps {
  activeMode: PlacementMode | null;
  onSelect: (mode: PlacementMode) => void;
  onClose: () => void;
}

const PLACEMENT_OPTIONS: {
  mode: PlacementMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    mode: 'connect',
    label: '顺序连线',
    description: '点击 Handle 依次连接',
    icon: <ArrowRight size={14} strokeWidth={2.5} />,
    color: 'var(--edge-color-sequential, #78716c)',
  },
  {
    mode: 'logic_switch',
    label: '条件分支',
    description: '放置 AI 判断分叉节点',
    icon: <GitBranch size={14} strokeWidth={2.5} />,
    color: 'var(--edge-color-conditional, #d97706)',
  },
  {
    mode: 'loop_group',
    label: '循环块',
    description: '放置可缩放的循环容器',
    icon: <Repeat size={14} strokeWidth={2.5} />,
    color: 'var(--edge-color-loop, #059669)',
  },
];

function CanvasPlacementPanel({ activeMode, onSelect, onClose }: CanvasPlacementPanelProps) {
  const handleSelect = useCallback(
    (mode: PlacementMode) => {
      onSelect(mode);
    },
    [onSelect]
  );

  return (
    <div
      className="canvas-placement-panel"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/50">
          放置工具
        </span>
        <button
          onClick={onClose}
          className="p-0.5 rounded-md hover:bg-muted transition-colors"
          aria-label="关闭面板"
        >
          <X size={12} strokeWidth={2.5} className="text-foreground/40" />
        </button>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-1">
        {PLACEMENT_OPTIONS.map((option) => {
          const isActive = activeMode === option.mode;
          return (
            <button
              key={option.mode}
              onClick={() => handleSelect(option.mode)}
              className={`canvas-placement-option ${isActive ? 'canvas-placement-option-active' : ''}`}
              style={{ '--option-color': option.color } as React.CSSProperties}
            >
              <span
                className="flex-shrink-0 opacity-70"
                style={{ color: isActive ? option.color : undefined }}
              >
                {option.icon}
              </span>
              <div className="min-w-0 text-left">
                <div className="text-[11px] font-bold font-serif text-foreground/80 leading-tight">
                  {option.label}
                </div>
                <div className="text-[9px] text-foreground/40 font-mono truncate">
                  {option.description}
                </div>
              </div>
              {isActive && (
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-auto"
                  style={{ background: option.color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CanvasPlacementPanel);
