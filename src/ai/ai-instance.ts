import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let asyncHooks: typeof import('async_hooks') | null = null;

if (typeof window === 'undefined') {
  try {
    asyncHooks = require('async_hooks');
  } catch (e: any) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      console.warn('async_hooks not available.', e);
    }
    asyncHooks = null;
  }
}


export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: 'AIzaSyDCaIAGfDojJYHCWmpbln6pWHwpCY3VLpA', // Updated API Key
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
