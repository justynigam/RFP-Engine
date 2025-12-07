'use server';
/**
 * @fileOverview Summarizes an RFP from a given URL.
 *
 * - summarizeRFPFromURL - A function that takes an RFP URL and returns a concise summary.
 * - SummarizeRFPFromURLInput - The input type for the summarizeRFPFromURL function.
 * - SummarizeRFPFromURLOutput - The return type for the summarizeRFPFromURL function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeRFPFromURLInputSchema = z.object({
  rfpUrl: z.string().url().describe('The URL of the RFP document.'),
});
export type SummarizeRFPFromURLInput = z.infer<typeof SummarizeRFPFromURLInputSchema>;

const SummarizeRFPFromURLOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the RFP document.'),
});
export type SummarizeRFPFromURLOutput = z.infer<typeof SummarizeRFPFromURLOutputSchema>;

export async function summarizeRFPFromURL(input: SummarizeRFPFromURLInput): Promise<SummarizeRFPFromURLOutput> {
  return summarizeRFPFromURLFlow(input);
}

const getRFPContent = ai.defineTool({
  name: 'getRFPContent',
  description: 'Downloads the content of an RFP from a given URL.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL of the RFP document.'),
  }),
  outputSchema: z.string(),
},
  async (input) => {
    try {
      const response = await fetch(input.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch RFP content from URL: ${input.url}`);
      }
      return await response.text();
    } catch (error: any) {
      console.error('Error fetching RFP content:', error);
      return `Error fetching RFP content: ${error.message}`;
    }
  });

const summarizeRFPPrompt = ai.definePrompt({
  name: 'summarizeRFPPrompt',
  model: 'ollama/llama3.2',
  input: { schema: SummarizeRFPFromURLInputSchema },
  output: { schema: SummarizeRFPFromURLOutputSchema },
  tools: [getRFPContent],
  prompt: `You are a sales agent whose job is to understand and summarize RFP documents.

  First, use the getRFPContent tool to download the contents of the RFP from the URL provided. 
  Then, summarize the key requirements from the RFP document that was downloaded from the following URL: {{{rfpUrl}}}.  Provide a concise summary of the RFP document so that a sales agent can quickly determine if it's a good fit for our products.

  Summary:`,
});

const summarizeRFPFromURLFlow = ai.defineFlow(
  {
    name: 'summarizeRFPFromURLFlow',
    inputSchema: SummarizeRFPFromURLInputSchema,
    outputSchema: SummarizeRFPFromURLOutputSchema,
  },
  async input => {
    const { output } = await summarizeRFPPrompt(input);
    return output!;
  }
);
