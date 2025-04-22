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
  prompt: `You are an AI assistant designed to engage new users in conversation.
  Generate a single, interesting and engaging initial prompt for the user to start a conversation with you.
  The prompt should be open-ended and encourage the user to explore your capabilities.
  Do not greet the user or introduce yourself, just give the prompt.

  Example Prompt: "If you could have any superpower, what would it be and why?"

  Your Prompt:`, // Removed extra newlines
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
