'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Maximize2,
  FileText,
  Home,
  Minimize2,
  ArrowDown,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RFP, BidStrategy } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { generateComplianceMatrix, type GenerateComplianceMatrixInput } from '@/ai/flows/generate-compliance-matrix';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { FinalResponseModal } from './final-response-modal';
import { RiskHeatmapModal, type Risk } from './risk-heatmap-modal';
import { ShieldAlert } from 'lucide-react';


type AgentName = 'Sales' | 'Summary' | 'Technical' | 'Pricing';
type AgentStatus = 'Idle' | 'Processing' | 'Complete' | 'Error' | 'Ready to start...' | 'Warning';

export interface Agent {
  name: AgentName;
  status: AgentStatus;
  content: React.ReactNode;
}

const statusMeta: Record<
  AgentStatus,
  { icon?: React.ReactNode; bg: string; text: string; }
> = {
  'Idle': { icon: <Loader2 className="h-4 w-4 animate-spin" />, bg: 'bg-card', text: 'text-muted-foreground' },
  'Processing': { icon: <Loader2 className="h-4 w-4 animate-spin" />, bg: 'bg-card', text: 'text-amber-400' },
  'Complete': { icon: <CheckCircle2 className="h-4 w-4" />, bg: 'bg-green-900/50', text: 'text-green-400' },
  'Error': { icon: <AlertCircle className="h-4 w-4" />, bg: 'bg-red-900/50', text: 'text-red-400' },
  'Warning': { icon: <AlertCircle className="h-4 w-4" />, bg: 'bg-yellow-900/50', text: 'text-yellow-400' },
  'Ready to start...': { bg: 'bg-card', text: 'text-muted-foreground' }
};

const AgentCard = ({ agent, isExpanded, onToggleExpand }: { agent: Agent, isExpanded: boolean, onToggleExpand: () => void }) => (
  <Card className={cn(
    "transition-all duration-500 border-2 border-transparent flex flex-col",
    statusMeta[agent.status].bg,
    {
      'border-green-500/50': agent.status === 'Complete',
      'border-yellow-500/50': agent.status === 'Warning',
      'border-primary/50 animate-pulse-glow': agent.status === 'Processing'
    },
    isExpanded ? 'h-auto' : 'h-40'
  )}>
    <CardHeader className="pb-2 flex flex-row items-start justify-between">
      <CardTitle className="text-lg font-headline flex items-center gap-2">
        <span className={cn(statusMeta[agent.status].text, "flex items-center gap-2")}>
          {statusMeta[agent.status].icon}
          {agent.name}
        </span>
      </CardTitle>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleExpand}>
        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
    </CardHeader>
    <CardContent className={cn("text-sm text-muted-foreground flex-grow overflow-hidden", { 'overflow-y-auto': isExpanded })}>
      <div className="overflow-hidden">
        {agent.content}
      </div>
    </CardContent>
  </Card>
);

const agentColors: Record<string, string> = {
  Orchestrator: 'text-cyan-400',
  Sales: 'text-rose-400',
  Summary: 'text-amber-400',
  Technical: 'text-violet-400',
  Pricing: 'text-lime-400',
};

const OrchestratorLog = ({ logs }: { logs: string[] }) => (
  <Card className="bg-black/80 border-gray-700">
    <CardHeader>
      <CardTitle className="font-headline text-green-400">Main Orchestrator Log</CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-64 pr-4">
        <div className="text-xs text-green-400 font-mono whitespace-pre-wrap">
          {logs.map((log, index) => {
            const match = log.match(/(\[.*?\])\s(.*?):(.*)/);
            if (!match) return <div key={index}>{log}</div>;

            const [, timestamp, agent, message] = match;
            const agentColor = agentColors[agent.trim()] || 'text-green-400';

            return (
              <div key={index} className="flex">
                <span className="text-gray-500">{timestamp}&nbsp;</span>
                <span className={cn(agentColor, 'font-bold')}>{agent}:</span>
                <span className="flex-1">{message}</span>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

export function SimulationClient({ rfp }: { rfp: RFP }) {
  const [agents, setAgents] = useState<Agent[]>([
    { name: 'Sales', status: 'Ready to start...', content: <p>Awaiting tasks...</p> },
    { name: 'Summary', status: 'Idle', content: <p>Awaiting tasks...</p> },
    { name: 'Technical', status: 'Idle', content: <p>Awaiting tasks...</p> },
    { name: 'Pricing', status: 'Idle', content: <p>Awaiting tasks...</p> },
  ]);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [orchestratorLogs, setOrchestratorLogs] = useState<string[]>(['[Orchestrator] Initializing RFP processing simulation...']);
  const [strategy, setStrategy] = useState<BidStrategy>('Balanced');
  const [expandedAgent, setExpandedAgent] = useState<AgentName | null>(null);
  const [isFinalResponseModalOpen, setIsFinalResponseModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [risks, setRisks] = useState<Risk[]>([]);
  const muteRef = useRef(false);

  const calculateRiskScore = (currentRisks: Risk[]) => {
    let score = 100;
    currentRisks.forEach(risk => {
      if (risk.severity === 'Critical') score -= 15;
      if (risk.severity === 'High') score -= 10;
      if (risk.severity === 'Medium') score -= 5;
    });
    return Math.max(0, score);
  };

  const riskScore = calculateRiskScore(risks);


  const { toast } = useToast();

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    muteRef.current = newState;
    if (newState) {
      window.speechSynthesis.cancel();
    }
  };

  const handleToggleExpand = (agentName: AgentName) => {
    setExpandedAgent(prev => prev === agentName ? null : agentName);
  }

  const speak = (text: string) => {
    if (muteRef.current) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1; // Slightly faster for professional tone
      // Try to find a standard US English voice
      const voices = window.speechSynthesis.getVoices();
      const usVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google'));
      if (usVoice) {
        utterance.voice = usVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const addLog = (agent: AgentName | 'Orchestrator', newLog: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setOrchestratorLogs(prev => [...prev, `[${timestamp}] ${agent}: ${newLog}`]);
  };

  const updateAgent = (agentName: AgentName, status: AgentStatus, content?: React.ReactNode) => {
    setAgents(prev => prev.map(a => {
      if (a.name === agentName) {
        return { ...a, status, content: content ?? a.content };
      }
      return a;
    }));
  };

  const handleStrategyChange = (newStrategy: BidStrategy) => {
    setStrategy(newStrategy);
    addLog('Orchestrator', `Bid Strategy updated to: ${newStrategy}. All agents will now use this strategy for pricing calculations.`);
  };

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const runComplianceAnalysis = async () => {
      try {
        addLog('Orchestrator', 'Tasking Technical Agent to generate a compliance matrix by cross-referencing RFP requirements with our product catalog.');
        updateAgent('Technical', 'Processing');

        const complianceInput: GenerateComplianceMatrixInput = {
          rfpRequirements: [
            { parameter: "Conductor Material", value: "Copper" },
            { parameter: "Voltage Rating", value: "1100V" },
            { parameter: "Insulation Material", value: "XLPE" },
          ],
          productSpecs: [
            {
              productName: "Phoenix-A1", specs: [
                { parameter: "Conductor Material", value: "Copper" },
                { parameter: "Voltage Rating", value: "1100V" },
                { parameter: "Insulation Material", value: "XLPE" },
              ]
            },
            {
              productName: "Griffin-C2", specs: [
                { parameter: "Conductor Material", value: "Copper" },
                { parameter: "Voltage Rating", value: "800V" },
                { parameter: "Insulation Material", value: "XLPE" },
              ]
            },
          ]
        };
        const result = await generateComplianceMatrix(complianceInput);

        const complianceContent = (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">Technical Match Analysis: <span className="text-amber-400">Phoenix-A1</span></p>
                <p className="text-sm font-medium mt-1">
                  Overall Spec Match: <span className="text-amber-400 font-bold text-lg">67%</span> <span className="text-amber-400">⚠️ (Requires MTO)</span>
                </p>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden opacity-90">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[120px]">Parameter</TableHead>
                    <TableHead>RFP Req</TableHead>
                    <TableHead>Product Value</TableHead>
                    <TableHead>Match %</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Voltage</TableCell>
                    <TableCell>1100V</TableCell>
                    <TableCell>800V</TableCell>
                    <TableCell className="text-red-400 font-bold">7%</TableCell>
                    <TableCell className="text-right text-red-400 flex justify-end items-center gap-1"><AlertCircle className="h-3 w-3" /> Critical</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Conductor</TableCell>
                    <TableCell>Copper</TableCell>
                    <TableCell>Copper</TableCell>
                    <TableCell className="text-green-400 font-bold">100%</TableCell>
                    <TableCell className="text-right text-green-400 flex justify-end items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Perfect</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Insulation</TableCell>
                    <TableCell>XLPE</TableCell>
                    <TableCell>XLPE</TableCell>
                    <TableCell className="text-green-400 font-bold">100%</TableCell>
                    <TableCell className="text-right text-green-400 flex justify-end items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Perfect</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Top 3 Recommendations */}
            <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700">
              <h4 className="font-semibold text-sm mb-2 text-gray-300">Top 3 Recommendations:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>1. <span className="font-bold text-gray-400">VoltMax-300</span></span>
                  <span className="text-gray-500">92% match - ₹1,25,000/m</span>
                </li>
                <li className="flex justify-between">
                  <span>2. <span className="font-bold text-gray-400">PowerShield-HV</span></span>
                  <span className="text-gray-500">85% match - ₹1,12,000/m</span>
                </li>
                <li className="flex justify-between text-amber-400/90 font-medium">
                  <span>3. <span className="font-bold">Phoenix-A1</span></span>
                  <span>67% match - ₹1,00,000/m (requires MTO)</span>
                </li>
              </ul>
            </div>

            {/* MTO Auto-Drafter Card */}
            <div className="bg-card border-2 border-yellow-500/50 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-headline text-yellow-400 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Engineering Request (MTO)
                </h4>
                <span className="text-[10px] font-mono bg-yellow-900/30 text-yellow-200 px-1.5 py-0.5 rounded">AUTO-GENERATED</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Request ID:</span>
                  <span className="font-mono">#99-NEW</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Base Product:</span>
                  <span>Phoenix-A1</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Modification:</span>
                  <span className="text-yellow-100">+2mm Insulation Thickness</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Cost Impact:</span>
                  <span className="text-red-300">+12% Material Cost</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Lead Time:</span>
                  <span className="text-red-300">+2 Weeks</span>
                </div>
              </div>
            </div>
          </div>
        );
        updateAgent('Technical', 'Warning', complianceContent);
        addLog('Technical', `Exact Match Failed. Closest Product: Phoenix-A1 (Voltage Mismatch). Initiating MTO Protocol.`);
        speak("Technical Analysis complete. Closest match: Phoenix-A1 with 67% compliance. Standard SKU not sufficient. Initializing Made-to-Order Protocol.");

        // Trigger Pricing
        timeouts.push(setTimeout(() => {
          addLog('Orchestrator', 'Tasking Pricing Agent to calculate costs based on the selected products and services.');
          updateAgent('Pricing', 'Processing');
        }, 500));

        timeouts.push(setTimeout(() => {
          const pricingContent = (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">Material Cost (MTO)</span>
                <span className="font-mono">₹11,76,00,000</span>
              </div>
              <div className="border-b pb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground">Testing & Compliance</span>
                  <span className="font-mono text-amber-400">₹70,00,000</span>
                </div>
                <div className="pl-4 text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>• Custom High-Voltage Test</span>
                    <span>₹45,00,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Material Cert (MTO)</span>
                    <span>₹25,00,000</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold">Total Bid Value</span>
                <span className="font-bold font-mono text-lg text-green-400">₹12,46,00,000</span>
              </div>
            </div>
          );
          updateAgent('Pricing', 'Complete', pricingContent);
          addLog('Pricing', 'Cost analysis complete. Quote generated based on MTO specifications (+12% premium).');
          speak("Pricing calculated. Total bid value: ₹12.46 Crores. Ready for review.");

          addLog('Orchestrator', 'All agents have completed their tasks. Simulation finished. Final response is ready for review.');
          setIsSimulationComplete(true);
        }, 1500));


      } catch (error) {
        console.error("Compliance analysis failed", error);
        addLog('Orchestrator', 'Technical Agent encountered a critical error during compliance matrix generation.');
        updateAgent('Technical', 'Error', <p>Failed to generate compliance matrix.</p>);
      }
    };

    // Stage 1: Sales Agent
    timeouts.push(setTimeout(() => {
      addLog('Orchestrator', 'Tasking Sales Agent to ingest and summarize the RFP from the provided URL.');
      updateAgent('Sales', 'Processing');
    }, 200));

    timeouts.push(setTimeout(() => {
      const detectedRisks: Risk[] = [
        {
          id: '1',
          category: 'Liquidated Damages (LD)',
          clause: 'Clause 14.2',
          severity: 'Critical',
          description: 'Penalty of 20% for delays.',
          standard: '10%'
        },
        {
          id: '2',
          category: 'Payment Terms',
          clause: 'Clause 8.1',
          severity: 'High',
          description: 'Payment Net 90 Days.',
          standard: 'Net 30'
        },
        {
          id: '3',
          category: 'Warranty Period',
          clause: 'Clause 22.4',
          severity: 'Medium',
          description: '24 Months comprehensive.',
          standard: '12 Months'
        }
      ];
      setRisks(detectedRisks);

      const salesContentText = (
        <div className="space-y-2">
          <p>RFP identified and summarized: Project is for a large office infrastructure upgrade.</p>
          <div className="bg-red-900/20 border border-red-500/50 p-2 rounded text-xs text-red-300">
            <p className="font-bold flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Risk Alert:</p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              {detectedRisks.map(r => (
                <li key={r.id}>{r.category}: {r.description} ({r.severity})</li>
              ))}
            </ul>
          </div>
        </div>
      );
      updateAgent('Sales', 'Complete', salesContentText);
      addLog('Sales', `RFP ingestion complete. Warning: High-risk commercial terms detected (LD: 20%, Net 90).`);
      speak("Scanning complete. RFP identified. Warning: High-risk commercial terms detected. Liquidated Damages at 20%.");

      addLog('Orchestrator', 'Tasking Summary Agent to extract key requirements for technical and pricing teams.');
      updateAgent('Summary', 'Processing');
    }, 1000));

    // Stage 2: Summary Agent
    timeouts.push(setTimeout(() => {
      const summaryContent = (
        <div>
          <p>Contextual summaries created:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>For Technical Agent:</strong> Extracted all technical specifications, including voltage ratings, material requirements, and performance benchmarks.</li>
            <li><strong>For Pricing Agent:</strong> Extracted all testing, delivery, and acceptance criteria that may impact cost.</li>
          </ul>
        </div>
      );
      updateAgent('Summary', 'Complete', summaryContent);
      addLog('Summary', 'Key requirements extracted. Verified all technical and pricing sections have been identified and contextualized for specialist agents.');
      speak("Key requirements extracted. Initializing Technical analysis.");
      runComplianceAnalysis();
    }, 1500));

    return () => timeouts.forEach(clearTimeout);
  }, [rfp.summary, toast]);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background dark text-foreground p-4 md:p-8 space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold font-headline text-center">
            AI Agent Swarm Simulation
          </h1>
          <p className="text-lg text-muted-foreground text-center">
            Automated RFP Response Generation for: <span className="font-semibold text-foreground">{rfp.title}</span>
          </p>
          <div className="flex justify-center items-center gap-4 pt-4">
            <span className="text-lg font-medium">Bid Strategy:</span>
            <div className="flex items-center gap-1 rounded-lg p-1 bg-card border">
              {(['Aggressive', 'Balanced', 'Premium'] as BidStrategy[]).map(s => (
                <button
                  key={s}
                  onClick={() => handleStrategyChange(s)}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                    strategy === s ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="ml-2"
              title={isMuted ? "Unmute Voice" : "Mute Voice"}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <main className="flex flex-col items-center gap-6">
          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <AgentCard
                agent={agents.find(a => a.name === 'Sales')!}
                isExpanded={expandedAgent === 'Sales'}
                onToggleExpand={() => handleToggleExpand('Sales')}
              />
              <AgentCard
                agent={agents.find(a => a.name === 'Summary')!}
                isExpanded={expandedAgent === 'Summary'}
                onToggleExpand={() => handleToggleExpand('Summary')}
              />
            </div>

            {/* Risk Heatmap Button */}
            <div className="flex justify-center items-center my-4 animate-in fade-in zoom-in duration-500 delay-1000">
              <Button
                onClick={() => setIsRiskModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-8 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] border-2 border-red-400 animate-pulse-slow flex items-center gap-3 transition-transform hover:scale-105"
              >
                <ShieldAlert className="h-6 w-6" />
                View Risk Heatmap
                <span className="bg-black/40 px-2 py-1 rounded text-sm font-mono ml-2">{riskScore}/100</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AgentCard
                agent={agents.find(a => a.name === 'Technical')!}
                isExpanded={expandedAgent === 'Technical'}
                onToggleExpand={() => handleToggleExpand('Technical')}
              />
              <AgentCard
                agent={agents.find(a => a.name === 'Pricing')!}
                isExpanded={expandedAgent === 'Pricing'}
                onToggleExpand={() => handleToggleExpand('Pricing')}
              />
            </div>
          </div>

          <div className="w-full max-w-5xl pt-8">
            <OrchestratorLog logs={orchestratorLogs} />
          </div>
        </main>

        <footer className="py-4 mt-8 flex justify-center gap-4">
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button size="lg" disabled={!isSimulationComplete} onClick={() => setIsFinalResponseModalOpen(true)}>
            <FileText className="mr-2" />
            {isSimulationComplete ? 'View Final Response' : 'Generating Response...'}
          </Button>
        </footer>
      </div>
      <FinalResponseModal
        isOpen={isFinalResponseModalOpen}
        onClose={() => setIsFinalResponseModalOpen(false)}
        rfp={rfp}
        agents={agents}
        strategy={strategy}
      />
      <RiskHeatmapModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        risks={risks}
        score={riskScore}
      />
    </>
  );
}
