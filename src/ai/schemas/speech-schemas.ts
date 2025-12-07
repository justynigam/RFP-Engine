import { z } from 'zod';

export const GenerateSpeechFromTextInputSchema = z.string();
export type GenerateSpeechFromTextInput = z.infer<
  typeof GenerateSpeechFromTextInputSchema
>;

export const GenerateSpeechFromTextOutputSchema = z.object({
  media: z.string().describe('The base64 encoded audio data with a data URI.'),
});
export type GenerateSpeechFromTextOutput = z.infer<
  typeof GenerateSpeechFromTextOutputSchema
>;
