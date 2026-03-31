import { notFound } from 'next/navigation';
import { fetchRunForServer } from '@/services/memory.server.service';
import MemoryView from './MemoryView';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemoryPage({ params }: Props) {
  const { id } = await params;
  const runDetail = await fetchRunForServer(id);

  if (!runDetail) {
    notFound();
  }

  return <MemoryView run={runDetail} />;
}
