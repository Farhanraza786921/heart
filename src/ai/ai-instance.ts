import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: 'AIzaSyDCaIAGfDojJYHCWmpbln6pWHwpCY3VLpA', // Updated API Key
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});

