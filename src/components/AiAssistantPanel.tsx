'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Send } from 'lucide-react';
import { GeminiChatClient } from '@/lib/geminiClient';
import { useTechTree } from '@/hooks/useTechTree';
import DOMPurify from 'dompurify';

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
  const [response, setResponse] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [geminiClient] = useState(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    return apiKey ? new GeminiChatClient(apiKey) : null;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim() && !file) return;
    if (!geminiClient) {
      setResponse('Error: Gemini API key not configured');
      return;
    }

    setIsLoading(true);
    setResponse('');
    setSuggestions([]);

    try {
      let prompt = message;

      // If file is uploaded, read and include in prompt
      if (file) {
        const fileText = await file.text();
        prompt = `${message}\n\nDocument content:\n${fileText}`;
      }

      // Enhanced prompt for tech tree editing
      const systemPrompt = `You are a technology analyst helping to update a nuclear and fusion energy technology tree. 
      
Current Tech Tree Context:
${JSON.stringify(techTree, null, 2)}

User request: ${prompt}

Analyze the content and suggest:
1. New nodes (technologies, milestones, or enabling technologies)
2. New edges (dependencies between technologies)
3. TRL updates for existing nodes

Format your response as:
1. A natural language explanation of your suggestions
2. A JSON block with structured suggestions in this format:
{
  "suggestions": [
    {
      "type": "node",
      "action": "add",
      "data": {
        "id": "unique_id",
        "label": "Technology Name",
        "type": "ReactorConcept|Milestone|EnablingTechnology",
        "trl_current": "3-4",
        "detailedDescription": "Description",
        "category": "Category"
      }
    },
    {
      "type": "edge",
      "action": "add",
      "data": {
        "source": "node_id",
        "target": "node_id"
      }
    },
    {
      "type": "trl_update",
      "action": "update",
      "data": {
        "node_id": "existing_node_id",
        "trl_current": "new_value"
      }
    }
  ]
}`;

      const aiResponse = await geminiClient.sendMessage(
        systemPrompt,
        techTree || { nodes: [], edges: [] },
        []
      );

      setResponse(aiResponse);

      // Try to extract JSON suggestions
      const jsonMatch = aiResponse.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.suggestions) {
            setSuggestions(parsed.suggestions);
          }
        } catch (e) {
          console.error('Failed to parse suggestions:', e);
        }
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Failed to get AI response'}`);
    } finally {
      setIsLoading(false);
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

      alert('Suggestion applied successfully');
      setSuggestions(suggestions.filter(s => s !== suggestion));
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to apply suggestion'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Tech Tree Assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Your Question or Request</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., 'Analyze this document and suggest new fusion technologies to add' or 'What TRL updates should we make based on recent progress?'"
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Upload Document (Optional)</label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="flex-1"
              />
              {file && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Clear
                </Button>
              )}
            </div>
            {file && (
              <p className="text-xs text-gray-600 mt-1">
                Selected: {file.name}
              </p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!message.trim() && !file)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="mr-2" size={16} />
                Get AI Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card className="flex-1 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">AI Response</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-96">
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  response.replace(/^```html\s*/i, '').replace(/```[\s\n]*$/, ''),
                  {
                    ALLOWED_TAGS: [
                      'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em',
                      'code', 'pre', 'br', 'a',
                    ],
                    ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
                  }
                ),
              }}
              className="prose prose-sm max-w-none"
            />
          </CardContent>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggested Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {suggestion.type === 'node' && 'Add/Update Node'}
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
    </div>
  );
};

export default AiAssistantPanel;