'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Upload } from 'lucide-react';
import { GeminiChatClient } from '@/lib/geminiClient';
import { useTechTree } from '@/hooks/useTechTree';
import DOMPurify from 'dompurify';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Suggestion {
  type: 'node' | 'edge' | 'trl_update';
  action: 'add' | 'update';
  data: Record<string, unknown>;
}

const AiAssistantPanel: React.FC = () => {
  const { techTree } = useTechTree();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [geminiClient] = useState(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    return apiKey ? new GeminiChatClient(apiKey) : null;
  });

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'user') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const extractJsonSuggestions = (text: string): Suggestion[] => {
    try {
      // Try to find JSON block in code blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        const parsed = JSON.parse(codeBlockMatch[1]);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          return parsed.suggestions;
        }
      }

      // Try to find raw JSON object
      const jsonMatch = text.match(/\{[\s\S]*"suggestions"[\s\S]*\]/);
      if (jsonMatch) {
        // Find the closing brace for the entire object
        let braceCount = 0;
        let jsonStr = '';
        for (let i = 0; i < jsonMatch[0].length; i++) {
          const char = jsonMatch[0][i];
          jsonStr += char;
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
          if (braceCount === 0 && char === '}') break;
        }
        
        const parsed = JSON.parse(jsonStr);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          return parsed.suggestions;
        }
      }
    } catch (e) {
      console.error('Failed to parse suggestions:', e);
    }
    return [];
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() && !file) return;
    if (!geminiClient) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Error: Gemini API key not configured',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim() + (file ? ` [File: ${file.name}]` : ''),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setSuggestions([]);

    try {
      let prompt = message;

      if (file) {
        const fileText = await file.text();
        prompt = `${message}\n\nDocument content:\n${fileText}`;
      }

      const systemPrompt = `You are a technology analyst helping to update a nuclear and fusion energy technology tree. 

Current Tech Tree has ${techTree?.nodes.length || 0} nodes and ${techTree?.edges.length || 0} edges.

User request: ${prompt}

Analyze the content and suggest changes to the tech tree. Format your response in two parts:

1. First, provide a natural language explanation of your analysis and suggestions using HTML formatting.

2. Then, provide structured suggestions in a JSON code block like this:
\`\`\`json
{
  "suggestions": [
    {
      "type": "node",
      "action": "add",
      "data": {
        "id": "unique_id",
        "label": "Technology Name",
        "type": "ReactorConcept",
        "trl_current": "3-4",
        "detailedDescription": "Description",
        "category": "Category"
      }
    }
  ]
}
\`\`\`

Valid suggestion types: "node", "edge", "trl_update"
Valid actions: "add", "update"`;

      const aiResponse = await geminiClient.sendMessage(
        systemPrompt,
        techTree || { nodes: [], edges: [] },
        []
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      const extractedSuggestions = extractJsonSuggestions(aiResponse);
      if (extractedSuggestions.length > 0) {
        setSuggestions(extractedSuggestions);
      }

      setMessage('');
      setFile(null);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get AI response'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAcceptSuggestion = async (suggestion: Suggestion) => {
    setIsLoading(true);
    try {
      let endpoint = '';
      let method = 'POST';
      let body = {};

      if (suggestion.type === 'node' && suggestion.action === 'add') {
        endpoint = '/investment-tech-tree/api/nodes';
        body = suggestion.data;
      } else if (suggestion.type === 'node' && suggestion.action === 'update') {
        const nodeId = (suggestion.data as { node_id?: string }).node_id;
        endpoint = `/investment-tech-tree/api/nodes/${nodeId}`;
        method = 'PUT';
        body = suggestion.data;
      } else if (suggestion.type === 'edge' && suggestion.action === 'add') {
        endpoint = '/investment-tech-tree/api/edges';
        body = suggestion.data;
      } else if (suggestion.type === 'trl_update') {
        const nodeId = (suggestion.data as { node_id?: string }).node_id;
        endpoint = `/investment-tech-tree/api/nodes/${nodeId}`;
        method = 'PUT';
        body = { trl_current: (suggestion.data as { trl_current?: string }).trl_current };
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to apply suggestion');
      }

      const successMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Suggestion applied successfully! The page will reload to show the changes.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, successMsg]);
      setSuggestions(suggestions.filter(s => s !== suggestion));
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Error applying suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <Card>
            <CardContent className="text-center text-gray-500 mt-8">
              <p className="text-lg mb-4">AI Assistant for Tech Tree Editing</p>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Ask questions about the tech tree, upload documents for analysis, 
                or request suggestions for new technologies, edges, or TRL updates.
              </p>
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
                    ? 'bg-slate-600 text-white border-slate-600'
                    : 'bg-gray-100 text-gray-900 border'
                }`}
              >
                <CardContent
                  className={`p-4 ${msg.type === 'user' ? 'p-3' : 'p-4 pl-6'}`}
                >
                  <div className="break-words">
                    {msg.type === 'assistant' ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            msg.content
                              .replace(/^```html\s*/i, '')
                              .replace(/```[\s\n]*$/, ''),
                            {
                              ALLOWED_TAGS: [
                                'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 
                                'strong', 'em', 'table', 'thead', 'tbody', 
                                'tr', 'td', 'th', 'code', 'pre', 'br', 'a',
                              ],
                              ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
                            }
                          ),
                        }}
                        className="prose prose-sm max-w-none [&_table]:overflow-x-auto [&_table]:block [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_td]:whitespace-nowrap [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:font-semibold [&_th]:text-left [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-3 [&_ol]:text-gray-700 [&_li]:mb-1 [&_a]:text-blue-600 [&_a]:hover:underline"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      msg.type === 'user' ? 'text-slate-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('de-DE', {
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
                  <span className="text-gray-500">Analyzing...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {suggestions.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold text-blue-900">
                Suggested Changes ({suggestions.length})
              </h4>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-white border border-blue-200 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.type === 'node' && `${suggestion.action === 'add' ? 'Add' : 'Update'} Node`}
                      {suggestion.type === 'edge' && 'Add Edge'}
                      {suggestion.type === 'trl_update' && 'Update TRL'}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      disabled={isLoading}
                    >
                      Accept
                    </Button>
                  </div>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(suggestion.data, null, 2)}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        {file && (
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <Upload size={14} />
            <span className="flex-1">{file.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
              className="h-6 px-2"
            >
              Remove
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the tech tree or request suggestions..."
              className="w-full resize-none pr-24 max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <label htmlFor="file-upload">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="p-1 h-8 w-8 cursor-pointer"
                  disabled={isLoading}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload size={18} />
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="submit"
                size="sm"
                disabled={(!message.trim() && !file) || isLoading}
                className="p-1 h-8 w-8"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AiAssistantPanel;