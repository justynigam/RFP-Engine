'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Shield,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RFP, BidStrategy, LegalRisk } from '@/lib/types';
import { RiskHeatmapModal } from './risk-heatmap-modal';
import { cn } from '@/lib/utils';
import { analyzeRFPForLegalRisks } from '@/ai/flows/analyze-rfp-for-legal-risks';
import { useToast } from '@/hooks/use-toast';

interface RfpCardProps {
  rfp: RFP;
  strategy: BidStrategy;
}

const statusIcons = {
  Processing: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  Completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  Error: <AlertCircle className="h-4 w-4 text-red-500" />,
  'Awaiting Review': <Clock className="h-4 w-4 text-yellow-500" />,
};

const riskColors = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
};

export function RfpCard({ rfp, strategy }: RfpCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [legalRisks, setLegalRisks] = useState<LegalRisk[] | null>(null);
  const [isLoadingRisks, setIsLoadingRisks] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleViewRisks = async () => {
    setIsLoadingRisks(true);
    setIsModalOpen(true);
    try {
      const result = await analyzeRFPForLegalRisks({ rfpUrl: rfp.url });
      setLegalRisks(result.legalRisks);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Risk Analysis Failed',
        description: 'Could not analyze legal risks for this RFP.',
      });
      setIsModalOpen(false);
    } finally {
      setIsLoadingRisks(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="font-headline text-lg mb-1">{rfp.title}</CardTitle>
            {rfp.riskLevel && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Risk</span>
                <div className={cn("h-3 w-3 rounded-full", riskColors[rfp.riskLevel])} />
              </div>
            )}
          </div>
          <CardDescription>
            From: {rfp.client} | Submitted: {rfp.submissionDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{rfp.summary}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Badge variant={rfp.status === 'Error' ? 'destructive' : 'secondary'} className="gap-2">
            {statusIcons[rfp.status]}
            {rfp.status}
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleViewRisks} disabled={isLoadingRisks || rfp.status === 'Error'}>
                {isLoadingRisks ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Shield className="mr-2 h-4 w-4" />}
                View Risks
            </Button>
            <Button size="sm" asChild>
              <Link href={`/dashboard/rfp/${rfp.id}/simulation`}>
                <FileText className="mr-2 h-4 w-4"/>
                Simulate
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
      {isClient && <RiskHeatmapModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        risks={legalRisks}
        isLoading={isLoadingRisks}
        rfpTitle={rfp.title}
      />}
    </>
  );
}
