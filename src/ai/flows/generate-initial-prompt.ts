'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate an initial conversation prompt for new users.
 *
 * - generateInitialPrompt - A function that generates the initial conversation prompt.
 * - GenerateInitialPromptInput - The input type for the generateInitialPrompt function (currently empty).
 * - GenerateInitialPromptOutput - The return type for the generateInitialPrompt function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateInitialPromptInputSchema = z.object({});
export type GenerateInitialPromptInput = z.infer<typeof GenerateInitialPromptInputSchema>;

const GenerateInitialPromptOutputSchema = z.object({
  prompt: z.string().describe('The initial conversation prompt for the user.'),
});
export type GenerateInitialPromptOutput = z.infer<typeof GenerateInitialPromptOutputSchema>;

export async function generateInitialPrompt(input: GenerateInitialPromptInput): Promise<GenerateInitialPromptOutput> {
  return generateInitialPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialPromptPrompt',
  input: {
    schema: z.object({}),
  },
  output: {
    schema: z.object({
      prompt: z.string().describe('The initial conversation prompt for the user.'),
    }),
  },
  prompt: `HEARTGPT`, // Removed extra newlines
});

const generateInitialPromptFlow = ai.defineFlow<
  typeof GenerateInitialPromptInputSchema,
  typeof GenerateInitialPromptOutputSchema
>({
  name: 'generateInitialPromptFlow',
  inputSchema: GenerateInitialPromptInputSchema,
  outputSchema: GenerateInitialPromptOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

