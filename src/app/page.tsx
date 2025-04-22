'use client';

import React from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import {Send} from 'lucide-react';
import {summarizeChatHistory} from '@/ai/flows/summarize-chat-history';
import {generateInitialPrompt} from '@/ai/flows/generate-initial-prompt';
import {chat} from '@/ai/flows/chat-flow';
import {Toaster} from '@/components/ui/toaster';

export default function Home() {
  const [messages, setMessages] = React.useState<{text: string; isUser: boolean}[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const {toast} = useToast();
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = React.useState('');
  const [summarizedHistory, setSummarizedHistory] = React.useState('');

  React.useEffect(() => {
    // Load initial prompt on component mount
    const loadInitialPrompt = async () => {
      try {
        const initialPromptResult = await generateInitialPrompt({});
        setMessages([{text: initialPromptResult.prompt, isUser: false}]);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load initial prompt.',
          variant: 'destructive',
        });
      }
    };
    loadInitialPrompt();
  }, [toast]);

  React.useEffect(() => {
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
      const aiResponseResult = await chat({
        userMessage: input,
        chatHistory: summarizedHistory + chatHistory,
      });
      const aiResponse = {
        text: aiResponseResult.aiResponse,
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
      setChatHistory(prevChatHistory => prevChatHistory + 'AI: ' + aiResponseResult.aiResponse + '\n');

      // Summarize chat history if it gets too long
      if (chatHistory.length > 1000) {
        const summaryResult = await summarizeChatHistory({chatHistory: chatHistory});
        setSummarizedHistory(summaryResult.summary + '\n');
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
