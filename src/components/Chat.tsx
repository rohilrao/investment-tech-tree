'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { ChatMessage, ChatHistory } from '@/lib/types';
import { GeminiChatClient } from '@/lib/geminiClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTechTree } from '@/hooks/useTechTree';

const Chat = () => {
  const { techTree } = useTechTree();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    // Only scroll if the last message is from the user or if it's the first message
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'user') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Reset counter if more than 1 hour has passed
    if (lastRequestTime < oneHourAgo) {
      setRequestCount(0);
      setLastRequestTime(now);
      return true;
    }

    // Check hourly limit
    if (requestCount >= MAX_REQUESTS_PER_HOUR) {
      setRateLimitExceeded(true);
      return false;
    }

    // Check minimum interval between requests
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !geminiClient) return;

    // Check rate limits
    if (!checkRateLimit()) {
      if (rateLimitExceeded) {
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Rate limit exceeded. You can make up to ${MAX_REQUESTS_PER_HOUR} requests per hour. Please try again later.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Please wait at least ${MIN_REQUEST_INTERVAL / 1000} seconds between requests.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
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

    try {
      const response = await geminiClient.sendMessage(
    userMessage.content,
    techTree || { nodes: [], edges: [] }, // Use fetched data
    messages,
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
        content:
          'Sorry, there was an error processing your request. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    // setRequestCount(0);
    // setLastRequestTime(0);
    // setRateLimitExceeded(false);
    localStorage.removeItem('tech-tree-chat-history');
    localStorage.removeItem('tech-tree-chat-scroll');
    // localStorage.removeItem('tech-tree-request-count');
    // localStorage.removeItem('tech-tree-last-request-time');
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
      handleSubmit(e);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    // Focus the textarea after setting the input
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Tech Tree Chat</CardTitle>
        <div className="flex items-center space-x-2">
          {rateLimitExceeded && (
            <Badge variant="destructive" className="text-xs">
              Rate Limited
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {requestCount}/{MAX_REQUESTS_PER_HOUR} requests per hour
          </Badge>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
              title="Clear Chat History"
            >
              <Trash2 size={18} />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={saveScrollPosition}
      >
        {messages.length === 0 ? (
          <Card>
            <CardContent className="text-center text-gray-500 mt-8">
              <p className="text-lg mb-4">Ask anything about the Tech Tree:</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    handleSuggestedQuestion('What is this Tech Tree about?')
                  }
                >
                  Explanation of Tech Tree
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    handleSuggestedQuestion(
                      'What are the enabling technologies with the highest impact?',
                    )
                  }
                >
                  Highest Impact
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    handleSuggestedQuestion(
                      'Which technologies have the highest TRL?',
                    )
                  }
                >
                  Highest TRL Technologies
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    handleSuggestedQuestion(
                      'What are the most promising investments?',
                    )
                  }
                >
                  Investment Opportunities
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-slate-600 text-white border-slate-600'
                    : 'bg-gray-100 text-gray-900 border'
                }`}
              >
                <CardContent
                  className={`p-4 ${message.type === 'user' ? 'p-3' : 'p-4 pl-6'}`}
                >
                  <div className="break-words">
                    {message.type === 'assistant' ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            // Remove ```html and ``` markers from the response
                            message.content
                              .replace(/^```html\s*/i, '')
                              .replace(/```[\s\n]*$/, ''),
                            {
                              ALLOWED_TAGS: [
                                'h2',
                                'h3',
                                'h4',
                                'p',
                                'ul',
                                'ol',
                                'li',
                                'strong',
                                'em',
                                'table',
                                'thead',
                                'tbody',
                                'tr',
                                'td',
                                'th',
                                'code',
                                'pre',
                                'br',
                                'a',
                              ],
                              ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
                            },
                          ),
                        }}
                        className="prose prose-sm max-w-none [&_table]:overflow-x-auto [&_table]:block [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_td]:whitespace-nowrap [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:font-semibold [&_th]:text-left [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-3 [&_ol]:text-gray-700 [&_li]:mb-1 [&_a]:text-blue-600 [&_a]:hover:underline"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.type === 'user'
                        ? 'text-slate-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}

        {isLoading && (
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

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the Tech Tree..."
              className="w-full resize-none pr-12 max-h-32"
              rows={1}
              disabled={isLoading || rateLimitExceeded}
            />
            <Button
              type="submit"
              size="sm"
              disabled={
                !input.trim() || isLoading || !geminiClient || rateLimitExceeded
              }
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default Chat;