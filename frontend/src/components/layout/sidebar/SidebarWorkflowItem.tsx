'use client';

import Link from 'next/link';
import { formatMonthDay } from '@/utils/date';
import type { WorkflowMeta } from '../Sidebar';

interface SidebarWorkflowItemProps {
  workflow: WorkflowMeta;
  active: boolean;
  onContextMenu: (event: React.MouseEvent, workflowId: string) => void;
}

export function SidebarWorkflowItem({
  workflow,
  active,
  onContextMenu,
}: SidebarWorkflowItemProps) {
  return (
    <Link
      href={`/workspace/${workflow.id}`}
      onContextMenu={(event) => onContextMenu(event, workflow.id)}
      className={`group relative mx-2 my-1 flex items-center gap-3 rounded-md px-3 py-2.5 transition-all duration-200 border-2 ${
        active
          ? 'bg-stone-200 dark:bg-stone-800 border-stone-800 dark:border-stone-400 text-stone-900 dark:text-stone-100 shadow-[2px_2px_0px_rgba(28,25,23,1)] dark:shadow-[2px_2px_0px_rgba(168,162,158,1)] -translate-y-[1px]'
          : 'border-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-stone-200 hover:border-dashed hover:border-stone-400 dark:hover:border-stone-600'
      }`}
    >
      <span className="relative shrink-0">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-current"
        >
          <rect
            x="1.5"
            y="1.5"
            width="13"
            height="13"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
          />
          <path
            d="M4.5 5.5h7M4.5 8h5M4.5 10.5h6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {workflow.isRunning ? (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-accent" />
        ) : null}
      </span>

      <div className="hidden min-w-0 flex-1 lg:block">
        <p className="truncate text-sm font-bold font-serif leading-tight">{workflow.name}</p>
        <p className="mt-0.5 text-[10px] font-mono tracking-widest text-stone-500">
          {formatMonthDay(workflow.updated_at, 'zh-CN')}
        </p>
      </div>
    </Link>
  );
}
