'use server';

/**
 * @fileOverview Implements the main chat flow for WebChatty.
 *
 * - chat - A function that accepts user input and returns an AI-generated response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  userMessage: z.string().describe('The user\'s message.'),
  chatHistory: z.string().describe('The chat history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  aiResponse: z.string().describe('The AI\'s response to the user message.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {
    schema: z.object({
      userMessage: z.string().describe('The user\'s message.'),
      chatHistory: z.string().describe('The chat history.'),
    }),
  },
  output: {
    schema: z.object({
      aiResponse: z.string().describe('The AI\'s response to the user message.'),
    }),
  },
  prompt: `You are a helpful and friendly AI assistant.
  Respond to the user based on the following context and chat history.
  Use the chat history to maintain context and provide relevant responses.

  Chat History:
  {{chatHistory}}

  User: {{userMessage}}
  AI:`,
});

const chatFlow = ai.defineFlow<
  typeof ChatInputSchema,
  typeof ChatOutputSchema
>({
  name: 'chatFlow',
  inputSchema: ChatInputSchema,
  outputSchema: ChatOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
