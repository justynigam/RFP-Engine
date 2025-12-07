'use client';

import { adjustPricingBasedOnWinLossAutopsy } from '@/ai/flows/adjust-pricing-based-on-win-loss-autopsy';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, Bot } from 'lucide-react';
import React, { useState, useTransition } from 'react';

export function KeyMetrics() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [pricingAdjustment, setPricingAdjustment] = useState<{
    adjustedPricingStrategy: string;
    suggestedPriceAdjustmentPercentage: number;
    reasoning: string;
  } | null>(null);

  const handleWinLossAutopsy = () => {
    startTransition(async () => {
      const result = await adjustPricingBasedOnWinLossAutopsy({
        rfpSummary: 'A large infrastructure project requiring 10,000 meters of high-voltage cabling.',
        pastBidOutcomes: [
          { bidPrice: 550000, win: false, reasonForLoss: 'Price was 10% higher than competitor' },
          { bidPrice: 500000, win: true },
          { bidPrice: 520000, win: false, reasonForLoss: 'Price was 5% higher than competitor' },
        ],
        currentPricingStrategy: 'Balanced',
      });
      setPricingAdjustment(result);
      toast({
        title: 'Pricing Strategy Adjusted',
        description: 'The AI has suggested a new pricing strategy based on the latest win/loss data.',
      });
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-blue-900/90 text-blue-50 border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium uppercase">Active RFPs</CardTitle>
          <Bot className="h-5 w-5 text-blue-300" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">3</div>
          <p className="text-xs text-blue-200 flex items-center">
            <ArrowUp className="h-4 w-4 mr-1" />
            1 New vs last week
          </p>
        </CardContent>
      </Card>
      <Card className="bg-purple-900/90 text-purple-50 border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium uppercase">SKU Match Rate</CardTitle>
          <Bot className="h-5 w-5 text-purple-300" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">98%</div>
          <p className="text-xs text-purple-200">Technical Compliance</p>
        </CardContent>
        <CardFooter className="pt-4">
          <Button size="sm" variant="secondary" onClick={handleWinLossAutopsy} disabled={isPending}>
            {isPending ? 'Analyzing...' : 'Adjust Pricing'}
          </Button>
        </CardFooter>
      </Card>
      {pricingAdjustment && (
        <Card className="md:col-span-2 bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-lg">AI-Suggested Pricing Adjustment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Strategy:</strong> {pricingAdjustment.adjustedPricingStrategy}</p>
            <p><strong>Adjustment:</strong> {pricingAdjustment.suggestedPriceAdjustmentPercentage}%</p>
            <p><strong>Reasoning:</strong> {pricingAdjustment.reasoning}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
