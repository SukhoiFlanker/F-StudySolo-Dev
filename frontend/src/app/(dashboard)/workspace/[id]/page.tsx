import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import WorkflowCanvasLoader from './WorkflowCanvasLoader';
import WorkflowPageShell from './WorkflowPageShell';
import { fetchWorkflowContentForServer } from '@/services/workflow.server.service';
import CanvasTraceLoader from '@/features/workflow/components/canvas/CanvasTraceLoader';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkflowPage({ params }: Props) {
  const { id } = await params;
  const workflow = await fetchWorkflowContentForServer(id);

  if (!workflow) {
    notFound();
  }

  return (
    <WorkflowPageShell workflowName={workflow.name}>
      <Suspense fallback={<CanvasTraceLoader />}>
        <WorkflowCanvasLoader
          key={workflow.id}
          workflowId={workflow.id}
          initialNodes={workflow.nodes_json ?? []}
          initialEdges={workflow.edges_json ?? []}
        />
      </Suspense>
    </WorkflowPageShell>
  );
}


