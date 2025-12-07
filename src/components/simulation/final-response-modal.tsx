'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RFP, BidStrategy } from '@/lib/types';
import { Agent } from './simulation-client';
import { Separator } from '../ui/separator';
import { Bot, FileDown, Briefcase, DollarSign, ListChecks } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FinalResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfp: RFP;
  agents: Agent[];
  strategy: BidStrategy;
}

const agentIcons: Record<string, React.ReactNode> = {
  Sales: <Briefcase className="h-5 w-5" />,
  Summary: <ListChecks className="h-5 w-5" />,
  Technical: <Bot className="h-5 w-5" />,
  Pricing: <DollarSign className="h-5 w-5" />,
};

export function FinalResponseModal({
  isOpen,
  onClose,
  rfp,
  agents,
  strategy,
}: FinalResponseModalProps) {
  const finalResponseRef = React.useRef<HTMLDivElement>(null);

  const handleExportPdf = async () => {
    const content = finalResponseRef.current;
    if (!content) return;

    // Temporarily make all text visible for capture
    const allTextElements = content.querySelectorAll('.text-muted-foreground');
    allTextElements.forEach(el => el.classList.add('text-foreground'));
    
    const canvas = await html2canvas(content, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#111827' // dark background
    });

    allTextElements.forEach(el => el.classList.remove('text-foreground'));


    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`RFP-Response-${rfp.id}.pdf`);
  };

  const getAgentContent = (name: string) => {
    const agent = agents.find(a => a.name === name);
    return agent ? agent.content : <p>No data available.</p>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl dark bg-gray-900 text-foreground border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">
            Final Bid Proposal
          </DialogTitle>
          <DialogDescription>
            AI-generated response for RFP: {rfp.title}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div ref={finalResponseRef} className="p-6 bg-gray-900 text-white">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-3xl font-bold font-headline text-white">
                  Bid Proposal for {rfp.client}
                </h1>
                <p className="text-lg text-gray-300">
                  Responding to: {rfp.title}
                </p>
                <p className="text-sm text-gray-400">Date: {new Date().toLocaleDateString()}</p>
              </div>

              <Separator className="bg-gray-600" />

              {/* Executive Summary */}
              <div>
                <h2 className="text-2xl font-semibold font-headline mb-4 text-cyan-400">
                  Executive Summary
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300">
                    <p>
                        This proposal outlines our comprehensive solution to meet the requirements of the "{rfp.title}" RFP. Our approach is guided by a <strong>{strategy}</strong> bid strategy, ensuring a competitive and value-driven offer. Our AI-powered analysis has thoroughly vetted all technical and pricing aspects to deliver a robust and compliant response. We are confident that our proposed solution, featuring the top-recommended <strong>Phoenix-A1</strong> product line, will exceed your expectations in performance, reliability, and cost-effectiveness.
                    </p>
                </div>
              </div>

              <Separator className="bg-gray-600" />
              
              {/* Agent Outputs */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold font-headline mb-4 text-cyan-400">
                  Detailed Analysis from AI Agents
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agents.map((agent) => (
                    <div key={agent.name} className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-white mb-2">
                        {agentIcons[agent.name]}
                        {agent.name} Agent Report
                      </h3>
                      <div className="text-sm text-gray-300 prose prose-invert max-w-none">{agent.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleExportPdf}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
