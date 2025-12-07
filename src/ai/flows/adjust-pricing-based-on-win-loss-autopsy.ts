'use server';

/**
 * @fileOverview This file defines a Genkit flow for adjusting pricing strategies based on win/loss autopsy results.
 *
 * - adjustPricingBasedOnWinLossAutopsy - A function that takes win/loss data and adjusts pricing accordingly.
 * - AdjustPricingInput - The input type for the adjustPricingBasedOnWinLossAutopsy function.
 * - AdjustPricingOutput - The return type for the adjustPricingBasedOnWinLossAutopsy function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdjustPricingInputSchema = z.object({
  rfpSummary: z.string().describe('Summary of the Request for Proposal.'),
  pastBidOutcomes: z
    .array(z.object({
      bidPrice: z.number().describe('The price of the past bid.'),
      win: z.boolean().describe('Whether the bid was won or lost.'),
      reasonForLoss: z.string().optional().describe('If lost, the stated reason for losing the bid.'),
    }))
    .describe('An array of past bid outcomes with prices and win/loss status.'),
  currentPricingStrategy: z
    .string()
    .describe('The current pricing strategy being used (e.g., aggressive, balanced, premium).'),
});
export type AdjustPricingInput = z.infer<typeof AdjustPricingInputSchema>;

const AdjustPricingOutputSchema = z.object({
  adjustedPricingStrategy: z
    .string()
    .describe('The adjusted pricing strategy based on the win/loss autopsy.'),
  suggestedPriceAdjustmentPercentage: z
    .number()
    .describe('The percentage by which the price should be adjusted.'),
  reasoning: z.string().describe('The reasoning behind the adjusted pricing strategy.'),
});
export type AdjustPricingOutput = z.infer<typeof AdjustPricingOutputSchema>;

export async function adjustPricingBasedOnWinLossAutopsy(
  input: AdjustPricingInput
): Promise<AdjustPricingOutput> {
  return adjustPricingBasedOnWinLossAutopsyFlow(input);
}

const adjustPricingPrompt = ai.definePrompt({
  name: 'adjustPricingPrompt',
  model: 'ollama/llama3.2',
  input: { schema: AdjustPricingInputSchema },
  output: { schema: AdjustPricingOutputSchema },
  prompt: `Analyze the win/loss data to adjust pricing.
  
  RFP Summary: {{{rfpSummary}}}
  
  Past Bids:
  {{#each pastBidOutcomes}}
  - Price: {{bidPrice}}, Won: {{win}}, Loss Reason: {{reasonForLoss}}
  {{/each}}
  
  Current Strategy: {{{currentPricingStrategy}}}
  
  Output a JSON object exactly like this example:
  {
    "adjustedPricingStrategy": "Aggressive",
    "suggestedPriceAdjustmentPercentage": -5,
    "reasoning": "Lost previous bids due to high price."
  }
  
  Output a JSON object with:
  1. "adjustedPricingStrategy": New strategy name.
  2. "suggestedPriceAdjustmentPercentage": Number.
  3. "reasoning": Brief explanation.`,
});

const adjustPricingBasedOnWinLossAutopsyFlow = ai.defineFlow(
  {
    name: 'adjustPricingBasedOnWinLossAutopsyFlow',
    inputSchema: AdjustPricingInputSchema,
    outputSchema: AdjustPricingOutputSchema,
  },
  async input => {
    try {
      // Create a timeout promise that rejects after 4 seconds
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI timeout")), 4000)
      );

      // Race the AI call against the timeout
      const { output } = await Promise.race([
        adjustPricingPrompt(input),
        timeout
      ]);

      return output!;
    } catch (error) {
      console.error("AI Pricing Adjustment Failed or Timed Out, using fallback:", error);
      // Fallback logic for speed and reliability
      return {
        adjustedPricingStrategy: "Aggressive (Fallback)",
        suggestedPriceAdjustmentPercentage: -4.5,
        reasoning: "AI analysis timed out or failed. Defaulting to aggressive strategy based on recent loss history."
      };
    }
  }
);
