import { getRFPById } from '@/lib/data';
import { SimulationClient } from '@/components/simulation/simulation-client';
import { notFound } from 'next/navigation';

export default async function SimulationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rfp = await getRFPById(id);

  if (!rfp) {
    notFound();
  }

  return (
    <div className="dark">
      <SimulationClient rfp={rfp} />
    </div>
  );
}
