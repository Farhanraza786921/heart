// Summarizes the chat history for WebChatty to maintain context in long conversations.
'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeChatHistoryInputSchema = z.object({
  chatHistory: z.string().describe('The complete chat history to summarize.'),
});
export type SummarizeChatHistoryInput = z.infer<typeof SummarizeChatHistoryInputSchema>;

const SummarizeChatHistoryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the chat history.'),
});
export type SummarizeChatHistoryOutput = z.infer<typeof SummarizeChatHistoryOutputSchema>;

export async function summarizeChatHistory(input: SummarizeChatHistoryInput): Promise<SummarizeChatHistoryOutput> {
  return summarizeChatHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChatHistoryPrompt',
  input: {
    schema: z.object({
      chatHistory: z.string().describe('The complete chat history to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the chat history.'),
    }),
  },
  prompt: `Please summarize the following chat history, focusing on the main topics discussed and any important decisions or agreements made.\n\nChat History:\n{{chatHistory}}`,
});

const summarizeChatHistoryFlow = ai.defineFlow<
  typeof SummarizeChatHistoryInputSchema,
  typeof SummarizeChatHistoryOutputSchema
>({
  name: 'summarizeChatHistoryFlow',
  inputSchema: SummarizeChatHistoryInputSchema,
  outputSchema: SummarizeChatHistoryOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
