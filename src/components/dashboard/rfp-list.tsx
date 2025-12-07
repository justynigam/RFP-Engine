'use client';

import { RfpCard } from './rfp-card';
import { RFP, BidStrategy } from '@/lib/types';

interface RfpListProps {
  rfps: RFP[];
  strategy: BidStrategy;
}

export function RfpList({ rfps, strategy }: RfpListProps) {
  return (
    <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight font-headline">RFP Pipeline</h1>
        <div className="grid gap-4 md:grid-cols-2">
            {rfps.map(rfp => (
                <RfpCard key={rfp.id} rfp={rfp} strategy={strategy} />
            ))}
        </div>
    </div>
  );
}
