import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Node, Edge } from '@xyflow/react';
import WorkflowCanvasLoader from './WorkflowCanvasLoader';
import RunButton from '@/components/business/workflow/RunButton';
import WorkflowPromptInput from '@/components/business/workflow/WorkflowPromptInput';

interface WorkflowContent {
  id: string;
  name: string;
  nodes_json: Node[];
  edges_json: Edge[];
}

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchWorkflowContent(id: string): Promise<WorkflowContent | null> {
  const apiBase = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:2038';
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  try {
    const res = await fetch(`${apiBase}/api/workflow/${id}/content`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }, // Always fresh for active editing
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function WorkflowPage({ params }: Props) {
  const { id } = await params;
  const workflow = await fetchWorkflowContent(id);

  if (!workflow) notFound();

  return (
    <div className="flex flex-col h-full">
      {/* Header + Run button */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border shrink-0">
        <h1 className="text-sm font-medium truncate">{workflow.name}</h1>
        <RunButton />
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden">
        <Suspense fallback={<CanvasSkeleton />}>
          <WorkflowCanvasLoader
            workflowId={workflow.id}
            initialNodes={workflow.nodes_json ?? []}
            initialEdges={workflow.edges_json ?? []}
          />
        </Suspense>
      </div>

      {/* Prompt input at bottom */}
      <WorkflowPromptInput />
    </div>
  );
}

function CanvasSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted/20 animate-pulse">
      <span className="text-muted-foreground text-sm">加载画布中…</span>
    </div>
  );
}
