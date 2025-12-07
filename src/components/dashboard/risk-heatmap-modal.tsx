'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LegalRisk } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';

interface RiskHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  risks: LegalRisk[] | null;
  isLoading: boolean;
  rfpTitle: string;
}

const riskMeta = {
  High: {
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
    dotClass: 'bg-red-500',
  },
  Medium: {
    badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30',
    dotClass: 'bg-yellow-500',
  },
  Low: {
    badgeClass: 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30',
    dotClass: 'bg-green-500',
  },
};

const RiskAccordionItem = ({ risk }: { risk: LegalRisk }) => {
    const meta = riskMeta[risk.riskLevel];
    return (
      <AccordionItem value={risk.clause}>
        <AccordionTrigger className="hover:no-underline hover:bg-muted/5 rounded-md px-3 text-left">
            <div className="flex items-center gap-3 flex-1">
                <div className={cn("h-2.5 w-2.5 rounded-full", meta.dotClass)}></div>
                <p className="flex-1 text-sm font-normal text-foreground/90">{risk.clause}</p>
                <Badge variant="outline" className={cn("ml-auto", meta.badgeClass)}>{risk.riskLevel}</Badge>
            </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 pt-2 pb-4 text-muted-foreground">
           <span className="font-semibold text-foreground/80">Reason:</span> {risk.explanation}
        </AccordionContent>
      </AccordionItem>
    );
};


export function RiskHeatmapModal({ isOpen, onClose, risks, isLoading, rfpTitle }: RiskHeatmapModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] dark bg-card text-foreground flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Compliance & Risk Heatmap</DialogTitle>
          <DialogDescription>
            AI-Identified Critical Clauses for {rfpTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden -mx-6">
          <ScrollArea className="h-full px-6">
            <div className="pb-4">
              {isLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}
              {!isLoading && risks && risks.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                    {risks.map((risk, index) => (
                        <RiskAccordionItem key={index} risk={risk} />
                    ))}
                </Accordion>
              )}
              {!isLoading && (!risks || risks.length === 0) && (
                <div className="text-center py-10 rounded-lg bg-green-900/20 border border-green-500/50">
                  <h3 className="text-lg font-medium text-green-400">No Significant Risks Found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">The AI analysis did not detect any high-priority legal clauses.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter className="pt-4 flex-shrink-0">
          <DialogClose asChild>
            <Button className="w-full">Close Analysis</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
