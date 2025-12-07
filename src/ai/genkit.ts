import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { ollama } from 'genkitx-ollama';

export const ai = genkit({
  plugins: [
    googleAI(),
    ollama({
      models: [{ name: 'llama3.2' }],
      serverAddress: 'http://127.0.0.1:11434', // default ollama local address
    }),
  ],
});
