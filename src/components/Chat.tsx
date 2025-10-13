'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Trash2, FlaskConical } from 'lucide-react';
import DOMPurify from 'dompurify';
import { ChatMessage, ChatHistory } from '@/lib/types';
import { GeminiChatClient } from '@/lib/geminiClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTechTree } from '@/hooks/useTechTree';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Chat = () => {
  const { techTree } = useTechTree();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResearcherMode, setIsResearcherMode] = useState(false);
  const [geminiClient, setGeminiClient] = useState<GeminiChatClient | null>(
    null,
  );
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rate limiting configuration
  const MAX_REQUESTS_PER_HOUR = 20;
  const MIN_REQUEST_INTERVAL = 3000;

  // Initialize Gemini client
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      setGeminiClient(new GeminiChatClient(apiKey));
    } else {
      console.error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
    }
  }, []);

  // Load chat history and rate limiting data from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('tech-tree-chat-history');
      if (savedHistory) {
        const history: ChatHistory = JSON.parse(savedHistory);
        setMessages(history.messages);

        // Restore scroll position after messages are loaded
        setTimeout(() => {
          const savedScrollPosition = localStorage.getItem(
            'tech-tree-chat-scroll',
          );
          if (savedScrollPosition && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = parseInt(
              savedScrollPosition,
              10,
            );
          }
        }, 100);
      }

      // Load rate limiting data
      const savedRequestCount = localStorage.getItem('tech-tree-request-count');
      const savedLastRequestTime = localStorage.getItem(
        'tech-tree-last-request-time',
      );

      if (savedRequestCount) {
        setRequestCount(parseInt(savedRequestCount, 10));
      }
      if (savedLastRequestTime) {
        setLastRequestTime(parseInt(savedLastRequestTime, 10));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const history: ChatHistory = {
        messages,
        lastUpdated: Date.now(),
      };
      try {
        localStorage.setItem('tech-tree-chat-history', JSON.stringify(history));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages]);

  // Save rate limiting data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tech-tree-request-count', requestCount.toString());
      localStorage.setItem(
        'tech-tree-last-request-time',
        lastRequestTime.toString(),
      );
    } catch (error) {
      console.error('Error saving rate limiting data:', error);
    }
  }, [requestCount, lastRequestTime]);

  // Auto-scroll to bottom only when user sends a message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'user' || lastMessage.isThinking) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    if (lastRequestTime < oneHourAgo) {
      setRequestCount(0);
      setLastRequestTime(now);
      return true;
    }

    if (requestCount >= MAX_REQUESTS_PER_HOUR) {
      setRateLimitExceeded(true);
      return false;
    }

    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      return false;
    }

    return true;
  };

  // --- Multi-Agent Simulation ---
  const runResearcherAgent = async (userMessage: ChatMessage) => {
    const thinkingMessageId = (Date.now() + 1).toString();
    const initialThinkingMessage: ChatMessage = {
      id: thinkingMessageId,
      type: 'assistant',
      content: '',
      timestamp: Date.now(),
      isThinking: true,
      thinkingSteps: ['Analyzing query...'],
    };
    setMessages((prev) => [...prev, initialThinkingMessage]);

    // Simulate agent steps
    await new Promise(resolve => setTimeout(resolve, 800));
    setMessages(prev => prev.map(m => m.id === thinkingMessageId ? { ...m, thinkingSteps: [...(m.thinkingSteps || []), 'Formulating research plan...'] } : m));

    await new Promise(resolve => setTimeout(resolve, 1200));
    setMessages(prev => prev.map(m => m.id === thinkingMessageId ? { ...m, thinkingSteps: [...(m.thinkingSteps || []), 'Searching external knowledge bases...'] } : m));
    
    // Actual API call
    try {
        if (!geminiClient || !techTree) throw new Error("Client or tech tree not ready.");
        const response = await geminiClient.sendMessage(
            `(Researcher Mode Query): ${userMessage.content}`,
            techTree,
            messages
        );

        const finalMessage: ChatMessage = {
            id: thinkingMessageId,
            type: 'assistant',
            content: response,
            timestamp: Date.now(),
            isThinking: false,
        };
        
        // Replace thinking message with final response
        setMessages(prev => prev.map(m => m.id === thinkingMessageId ? finalMessage : m));
    } catch (error) {
        const errorMessage: ChatMessage = {
            id: thinkingMessageId,
            type: 'assistant',
            content: `Sorry, there was an error during the research process. Please try again.`,
            timestamp: Date.now(),
            isThinking: false,
        };
        setMessages(prev => prev.map(m => m.id === thinkingMessageId ? errorMessage : m));
    }
  }

  const runStandardAgent = async (userMessage: ChatMessage) => {
      try {
        if (!geminiClient || !techTree) throw new Error("Client or tech tree not ready.");
        const response = await geminiClient.sendMessage(
            userMessage.content,
            techTree,
            messages
        );

        const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: response,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: 'Sorry, there was an error processing your request. Please try again.',
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
    }
  }


  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || !geminiClient) return;

    if (!checkRateLimit()) {
      const errorContent = rateLimitExceeded
        ? `Rate limit exceeded. You can make up to ${MAX_REQUESTS_PER_HOUR} requests per hour. Please try again later.`
        : `Please wait at least ${MIN_REQUEST_INTERVAL / 1000} seconds between requests.`;
      
      setMessages((prev) => [...prev, {
        id: Date.now().toString(), type: 'assistant', content: errorContent, timestamp: Date.now()
      }]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setRequestCount((prev) => prev + 1);
    setLastRequestTime(Date.now());
    setRateLimitExceeded(false);

    if (isResearcherMode) {
        await runResearcherAgent(userMessage);
    } else {
        await runStandardAgent(userMessage);
    }
    setIsLoading(false);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
        setMessages([]);
        localStorage.removeItem('tech-tree-chat-history');
        localStorage.removeItem('tech-tree-chat-scroll');
    }
  };

  const saveScrollPosition = () => {
    if (messagesContainerRef.current) {
      localStorage.setItem(
        'tech-tree-chat-scroll',
        messagesContainerRef.current.scrollTop.toString(),
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-lg font-semibold">Tech Tree Chat</CardTitle>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2">
            <FlaskConical size={16} className={isResearcherMode ? 'text-blue-600' : 'text-gray-500'}/>
            <Label htmlFor="researcher-mode" className="text-sm font-medium">Researcher Mode</Label>
            <Switch
              id="researcher-mode"
              checked={isResearcherMode}
              onCheckedChange={setIsResearcherMode}
            />
          </div>
          <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
              title="Clear Chat History"
              disabled={messages.length === 0}
            >
              <Trash2 size={18} />
            </Button>
        </div>
      </CardHeader>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={saveScrollPosition}
      >
        {messages.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center text-gray-500 p-8">
              <p className="text-lg mb-4">Ask anything about the Tech Tree</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => handleSuggestedQuestion('What is this Tech Tree about?')}>What is this Tech Tree about?</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => handleSuggestedQuestion('Compare Tokamaks and Stellarators.')}>Compare Tokamaks and Stellarators</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => handleSuggestedQuestion('Which technologies have the highest TRL?')}>Highest TRL Technologies</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => handleSuggestedQuestion('What are the most promising investments for near-term fusion?')}>Promising Investments</Badge>
              </div>
               <div className="mt-6 pt-4 border-t border-dashed">
                 <p className="text-sm text-gray-600">Or, enable <span className="font-semibold text-blue-600">Researcher Mode</span> for deeper analysis and web-powered answers.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] ${
                  msg.type === 'user'
                    ? 'bg-slate-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <CardContent className="p-4">
                  <div className="break-words">
                    {msg.isThinking ? (
                      <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-600">
                             <Loader2 size={16} className="animate-spin" />
                             <span className="font-semibold">Researcher Agent is working...</span>
                          </div>
                          <ul className="list-disc list-inside text-sm text-gray-500 pl-2 space-y-1">
                              {msg.thinkingSteps?.map((step, index) => <li key={index}>{step}</li>)}
                          </ul>
                      </div>
                    ) : msg.type === 'assistant' ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            msg.content
                              .replace(/^```html\s*/i, '')
                              .replace(/```[\s\n]*$/, ''),
                            {
                              ALLOWED_TAGS: ['h2','h3','h4','p','ul','ol','li','strong','em','table','thead','tbody','tr','td','th','code','pre','br','a'],
                              ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
                            }
                          ),
                        }}
                        className="prose prose-sm max-w-none"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                  <div className={`text-xs mt-2 ${ msg.type === 'user' ? 'text-slate-100' : 'text-gray-500' }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}

        {isLoading && !messages.some(m => m.isThinking) && (
          <div className="flex justify-start">
            <Card className="bg-gray-100 border">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin text-gray-500" />
                  <span className="text-gray-500">Thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isResearcherMode ? "Ask the researcher agent..." : "Ask a question..."}
              className="w-full resize-none pr-12 max-h-32"
              rows={1}
              disabled={isLoading || rateLimitExceeded}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading || !geminiClient || rateLimitExceeded}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line.
        </p>
      </div>
    </div>
  );
};

export default Chat;
