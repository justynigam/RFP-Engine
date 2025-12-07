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
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface Risk {
    id: string;
    category: string;
    clause: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    description: string;
    standard: string;
}

interface RiskHeatmapModalProps {
    isOpen: boolean;
    onClose: () => void;
    risks: Risk[];
    score: number;
}

const severityColors = {
    'Critical': { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-500', label: 'text-red-400' },
    'High': { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500', label: 'text-orange-400' },
    'Medium': { border: 'border-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500', label: 'text-yellow-400' },
    'Low': { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500', label: 'text-blue-400' },
};

export function RiskHeatmapModal({ isOpen, onClose, risks, score }: RiskHeatmapModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-gray-900 text-foreground border-red-900/50">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline flex items-center gap-2 text-red-500">
                        <ShieldAlert className="h-6 w-6" />
                        Risk & Compliance Heatmap
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Automated analysis of commercial terms and legal risks.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Overall Score */}
                    <div className="flex items-center justify-between bg-red-950/30 p-4 rounded-lg border border-red-900/50">
                        <div>
                            <h3 className="text-lg font-semibold text-red-400">
                                {score < 70 ? "Critical Risk Detected" : score < 90 ? "High Commercial Risk" : "Moderate Risk"}
                            </h3>
                            <p className="text-sm text-red-200/70">Requires immediate legal review before bidding.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl font-bold text-red-500">{score}</span>
                            <span className="text-sm text-gray-500">/100 Risk Score</span>
                        </div>
                    </div>

                    {/* Risk Breakdown */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Identified Issues</h4>

                        {risks.map((risk) => (
                            <div key={risk.id} className={`bg-gray-800/50 p-3 rounded border-l-4 ${severityColors[risk.severity].border} flex justify-between items-start`}>
                                <div>
                                    <div className="flex items-center gap-2 font-semibold text-white">
                                        <AlertTriangle className={`h-4 w-4 ${severityColors[risk.severity].text}`} />
                                        {risk.category}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{risk.clause}: {risk.description}</p>
                                </div>
                                <div className="text-right text-xs">
                                    <span className={`block ${severityColors[risk.severity].label} font-bold uppercase`}>{risk.severity}</span>
                                    <span className="text-gray-500">Standard: {risk.standard}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-red-900/50 hover:bg-red-950/50 hover:text-red-400">
                        Close Analysis
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
