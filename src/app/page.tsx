'use client';

import {useState, useRef, useEffect} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {generateInitialPrompt} from '@/ai/flows/generate-initial-prompt';
import {useToast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import {Send} from 'lucide-react';

// const initialPromptPromise = generateInitialPrompt({}); // REMOVE

export default function Home() {
  const [messages, setMessages] = useState<
    {text: string; isUser: boolean}[]
  >([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  useEffect(() => {
    // initialPromptPromise.then(result => { // REMOVE
    //   setInitialPrompt(result.prompt);
    //   setMessages([{text: result.prompt, isUser: false}]);
    // });
    // Moved the call to generateInitialPrompt inside useEffect
    const fetchInitialPrompt = async () => {
      try {
        const result = await generateInitialPrompt({});
        setInitialPrompt(result.prompt);
        setMessages([{text: result.prompt, isUser: false}]);
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
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response - replace with actual AI call
      await new Promise(resolve => setTimeout(resolve, 500));
      const aiResponse = {
        text: `This is a simulated AI response to: "${input}"`,
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
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
                ? 'ml-auto bg-accent text-accent-foreground'
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
    </div>
  );
}
