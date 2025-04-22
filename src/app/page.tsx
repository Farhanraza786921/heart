'use client';

import {useState, useRef, useEffect} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {generateInitialPrompt} from '@/ai/flows/generate-initial-prompt';
import {useToast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import {Send} from 'lucide-react';
import {summarizeChatHistory} from '@/ai/flows/summarize-chat-history'; // Import summarizeChatHistory
import {ai} from '@/ai/ai-instance';

export default function Home() {
  const [messages, setMessages] = useState<
    {text: string; isUser: boolean}[]
  >([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState('');
  const [summarizedHistory, setSummarizedHistory] = useState('');

  useEffect(() => {
    const fetchInitialPrompt = async () => {
      try {
        const result = await generateInitialPrompt({});
        setInitialPrompt(result.prompt);
        setMessages([{text: result.prompt, isUser: false}]);
        setChatHistory(result.prompt + '\n');
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to get initial prompt.',
          variant: 'destructive',
        });
      }
    };
    fetchInitialPrompt();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {text: input, isUser: true};
    setMessages(prev => [...prev, userMessage]);
    setChatHistory(prevChatHistory => prevChatHistory + 'User: ' + input + '\n');
    setInput('');
    setIsLoading(true);

    try {
      // Call Genkit flow for AI response
      const aiResponseText = await getAIResponse(input, summarizedHistory + chatHistory);
      const aiResponse = {
        text: aiResponseText,
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
      setChatHistory(prevChatHistory => prevChatHistory + 'AI: ' + aiResponseText + '\n');

      // Summarize chat history if it gets too long
      if (chatHistory.length > 1000) {
        const summary = await summarizeChatHistory({chatHistory: chatHistory});
        setSummarizedHistory(summary.summary + '\n');
        setChatHistory('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get AI response.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Define the getAIResponse function to interact with a Genkit flow
  async function getAIResponse(userMessage: string, history: string): Promise<string> {
    // This is a placeholder, replace with your actual Genkit flow invocation
    // For example, if you had a flow named 'chatFlow':
    const response = await ai.callPrompt({
      prompt: `You are a helpful assistant. Respond to the user based on the following context:
Context: ${history}
User: ${userMessage}
Assistant:`,
      });
    return response.output;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'rounded-lg p-3 w-fit max-w-[80%]',
              message.isUser
                ? 'ml-auto bg-primary text-primary-foreground'
                : 'mr-auto bg-secondary text-secondary-foreground'
            )}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto bg-secondary text-secondary-foreground rounded-lg p-3 w-fit">
            Thinking...
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter your message..."
            className="resize-none shadow-sm"
            rows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

import { Toaster } from "@/components/ui/toaster"
