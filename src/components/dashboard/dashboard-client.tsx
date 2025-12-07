'use client';

import React, { useState } from 'react';
import { NewRfpForm } from './new-rfp-form';
import { RfpList } from './rfp-list';
import { RFP, BidStrategy } from '@/lib/types';
import { summarizeRFPFromURL } from '@/ai/flows/summarize-rfp-from-url';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function DashboardClient({ initialRfps }: { initialRfps: RFP[] }) {
  const [rfps, setRfps] = useState<RFP[]>(initialRfps);
  const { toast } = useToast();

  const handleNewRfp = async (url: string) => {
    const newRfpId = `rfp-${String(rfps.length + 1).padStart(3, '0')}`;
    const newRfpPlaceholder: RFP = {
      id: newRfpId,
      title: 'Analyzing RFP...',
      summary: 'AI is currently processing the document.',
      status: 'Processing',
      submissionDate: new Date().toISOString().split('T')[0],
      client: 'Unknown',
      url,
    };

    setRfps(prev => [newRfpPlaceholder, ...prev]);

    try {
      const result = await summarizeRFPFromURL({ rfpUrl: url });

      const updatedRfp: RFP = {
        ...newRfpPlaceholder,
        title: `RFP from ${new URL(url).hostname}`,
        summary: result.summary,
        status: 'Awaiting Review',
      };

      setRfps(prev => prev.map(r => r.id === newRfpId ? updatedRfp : r));
      toast({
        title: 'RFP Summarized',
        description: `Successfully processed RFP from ${url}`,
      });
    } catch (error) {
      console.error(error);
      const errorRfp = {
        ...newRfpPlaceholder,
        title: `Failed to process RFP`,
        summary: error instanceof Error ? error.message : "An unexpected error occurred.",
        status: 'Error' as const,
      };
      setRfps(prev => prev.map(r => r.id === newRfpId ? errorRfp : r));
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: `Could not process RFP from ${url}.`,
      });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <RfpList rfps={rfps} strategy="Balanced" />
      </div>
      <div className="lg:col-span-1 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">URL Scanner</CardTitle>
            <CardDescription>Scan a set of predefined URLs.</CardDescription>
          </CardHeader>
          <CardContent>
            <NewRfpForm onSubmit={handleNewRfp} />
          </CardContent>
        </Card>
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Agent Logic Log</CardTitle>
            <CardDescription>Live Agent Activity</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[200px]">
            <div className="h-full rounded-md bg-muted/50 p-4 text-sm font-mono overflow-y-auto space-y-2 max-h-[300px]">
              <p className="text-green-400">{`> Sales Agent: Scanned URL... Found RFP #102`}</p>
              <p className="text-blue-400">{`> Tech Agent: Matching 'XLPE Cable' to SKU #5501... (98% Match)`}</p>
              <p className="text-muted-foreground">{`> System: Waiting for new inputs...`}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
