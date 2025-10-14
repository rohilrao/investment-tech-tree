// src/components/AiAssistantPanel.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Send, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  ToolConfirmationCard,
  SuggestionCard,
  DeletionNoticeCard,
  PlanSummaryCard
} from '@/components/agent/AgentCards';
import {
  AgentApiResponse,
  AgentAction,
  AgentStatus,
  InterruptionType
} from '@/lib/agent-types';

interface AgentState {
  conversationId: string | null;
  status: AgentStatus;
  interruptionType: InterruptionType;
  uiMessage: string;
  payload: any;
  acceptedActions: Set<number>;
  rejectedActions: Set<number>;
}

const AiAssistantPanel: React.FC = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>({
    conversationId: null,
    status: 'COMPLETE',
    interruptionType: null,
    uiMessage: '',
    payload: null,
    acceptedActions: new Set(),
    rejectedActions: new Set()
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentState]);

  // File reading functions
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      if (fileSizeMB > 10) {
        alert(`Warning: File is ${fileSizeMB.toFixed(1)}MB. Very large files may take longer to process. Consider using a smaller file.`);
      }
      
      setFile(selectedFile);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
    textareaRef.current?.focus();
  };

  const callAgentAPI = async (body: any): Promise<AgentApiResponse> => {
    const response = await fetch('/investment-tech-tree/api/agents/editor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to communicate with agent');
    }

    return await response.json();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() && !file) return;

    setIsLoading(true);

    try {
      let fileContent = null;
      
      if (file) {
        // Check if it's a PDF or binary file
        const isPDF = file.type === 'application/pdf';
        const isBinary = isPDF || file.type.includes('application/');
        
        if (isBinary) {
          // Read as Base64 for PDFs and binary files
          const base64Content = await readFileAsBase64(file);
          fileContent = {
            content: base64Content,
            filename: file.name,
            mimeType: file.type,
            isBase64: true
          };
        } else {
          // Read as text for .txt files
          const content = await readFileAsText(file);
          fileContent = {
            content,
            filename: file.name,
            mimeType: file.type,
            isBase64: false
          };
        }
      }

      const response = await callAgentAPI({
        conversationId: null,
        message: message.trim(),
        file: fileContent
      });

      setAgentState({
        conversationId: response.conversationId,
        status: response.status,
        interruptionType: response.interruptionType,
        uiMessage: response.uiMessage,
        payload: response.payload,
        acceptedActions: new Set(),
        rejectedActions: new Set()
      });

      setMessage('');
      setFile(null);
    } catch (error) {
      console.error('Error:', error);
      setAgentState({
        ...agentState,
        status: 'ERROR',
        uiMessage: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolApproval = async (approved: boolean) => {
    if (!agentState.conversationId) return;

    setIsLoading(true);

    try {
      const response = await callAgentAPI({
        conversationId: agentState.conversationId,
        message: approved ? 'Approved' : 'Denied',
        userApproval: {
          type: 'tool_approval'
        }
      });

      setAgentState({
        ...agentState,
        status: response.status,
        interruptionType: response.interruptionType,
        uiMessage: response.uiMessage,
        payload: response.payload
      });
    } catch (error) {
      console.error('Error:', error);
      setAgentState({
        ...agentState,
        status: 'ERROR',
        uiMessage: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionAccept = (index: number) => {
    const newAccepted = new Set(agentState.acceptedActions);
    newAccepted.add(index);
    
    const newRejected = new Set(agentState.rejectedActions);
    newRejected.delete(index);
    
    setAgentState({
      ...agentState,
      acceptedActions: newAccepted,
      rejectedActions: newRejected
    });
  };

  const handleActionReject = (index: number) => {
    const newRejected = new Set(agentState.rejectedActions);
    newRejected.add(index);
    
    const newAccepted = new Set(agentState.acceptedActions);
    newAccepted.delete(index);
    
    setAgentState({
      ...agentState,
      acceptedActions: newAccepted,
      rejectedActions: newRejected
    });
  };

  const executeAction = async (action: AgentAction) => {
    try {
      let endpoint = '';
      let method = '';
      let body: any = {};

      switch (action.action) {
        case 'ADD_NODE':
          endpoint = '/investment-tech-tree/api/nodes';
          method = 'POST';
          body = {
            id: action.payload.id,
            label: action.payload.label,
            type: action.payload.type,
            category: action.payload.category,
            trl_current: action.payload.trl_current,
            detailedDescription: action.payload.detailedDescription,
            references: action.payload.references
          };
          break;

        case 'UPDATE_NODE':
          endpoint = `/investment-tech-tree/api/nodes/${action.payload.nodeId}`;
          method = 'PUT';
          body = action.payload.updates;
          break;

        case 'ADD_EDGE':
          endpoint = '/investment-tech-tree/api/edges';
          method = 'POST';
          body = {
            source: action.payload.source,
            target: action.payload.target
          };
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Failed to execute ${action.action}`);
      }

      return true;
    } catch (error) {
      console.error('Error executing action:', error);
      return false;
    }
  };

  const handleExecuteAcceptedActions = async () => {
    if (!agentState.payload?.plan) return;

    setIsLoading(true);
    const plan = agentState.payload.plan as AgentAction[];
    const acceptedIndices = Array.from(agentState.acceptedActions);
    
    let successCount = 0;
    
    for (const index of acceptedIndices) {
      const action = plan[index];
      const success = await executeAction(action);
      if (success) successCount++;
    }

    setIsLoading(false);

    if (successCount > 0) {
      alert(`Successfully executed ${successCount} action(s). Refreshing page...`);
      window.location.reload();
    } else {
      alert('No actions were executed successfully.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderContent = () => {
    // Initial state
    if (agentState.status === 'COMPLETE' && !agentState.uiMessage) {
      return (
        <Card>
          <CardContent className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-4">AI Agent for Tech Tree Editing</p>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
              Upload a document (PDF, TXT) for analysis, or use one of the prompts below.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSuggestedQuestion('Analyze the attached document for new technologies and milestones.')}
              >
                Analyze document
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSuggestedQuestion('Based on the attached paper, suggest updates to existing nodes.')}
              >
                Update from paper
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSuggestedQuestion('Identify missing dependencies based on this document.')}
              >
                Find missing connections
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Error state
    if (agentState.status === 'ERROR') {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{agentState.uiMessage}</p>
          </CardContent>
        </Card>
      );
    }

    // Tool confirmation needed
    if (agentState.interruptionType === 'TOOL_CONFIRMATION') {
      return (
        <>
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-gray-700">{agentState.uiMessage}</p>
            </CardContent>
          </Card>
          <ToolConfirmationCard
            toolRequest={agentState.payload}
            onApprove={() => handleToolApproval(true)}
            onDeny={() => handleToolApproval(false)}
          />
        </>
      );
    }

    // Plan confirmation needed
    if (agentState.interruptionType === 'PLAN_CONFIRMATION') {
      const plan = agentState.payload?.plan || [];
      const deletionNotices = agentState.payload?.deletionNotices || [];

      return (
        <div className="space-y-4">
          <PlanSummaryCard
            summary={agentState.uiMessage}
            totalActions={plan.length}
            deletionNotices={deletionNotices.length}
          />

          {deletionNotices.map((notice: any, idx: number) => (
            <DeletionNoticeCard key={`deletion-${idx}`} notice={notice} />
          ))}

          {plan.map((action: AgentAction, idx: number) => (
            <SuggestionCard
              key={`action-${idx}`}
              action={action}
              index={idx}
              onAccept={() => handleActionAccept(idx)}
              onReject={() => handleActionReject(idx)}
              isAccepted={agentState.acceptedActions.has(idx)}
              isRejected={agentState.rejectedActions.has(idx)}
            />
          ))}

          {agentState.acceptedActions.size > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">
                      {agentState.acceptedActions.size} action(s) ready to execute
                    </p>
                    <p className="text-sm text-green-700">
                      Click execute to apply all accepted changes.
                    </p>
                  </div>
                  <Button
                    onClick={handleExecuteAcceptedActions}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Executing...
                      </>
                    ) : (
                      'Execute All'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // Deletion notice
    if (agentState.interruptionType === 'DELETION_NOTICE') {
      const deletionNotices = agentState.payload?.deletionNotices || [];
      const plan = agentState.payload?.plan || [];

      return (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-700">{agentState.uiMessage}</p>
            </CardContent>
          </Card>

          {deletionNotices.map((notice: any, idx: number) => (
            <DeletionNoticeCard key={`deletion-${idx}`} notice={notice} />
          ))}

          {plan.length > 0 && (
            <>
              <PlanSummaryCard
                summary="Additional suggestions:"
                totalActions={plan.length}
              />

              {plan.map((action: AgentAction, idx: number) => (
                <SuggestionCard
                  key={`action-${idx}`}
                  action={action}
                  index={idx}
                  onAccept={() => handleActionAccept(idx)}
                  onReject={() => handleActionReject(idx)}
                  isAccepted={agentState.acceptedActions.has(idx)}
                  isRejected={agentState.rejectedActions.has(idx)}
                />
              ))}
            </>
          )}
        </div>
      );
    }

    // Complete state
    if (agentState.status === 'COMPLETE' && agentState.uiMessage) {
      return (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-700">{agentState.uiMessage}</p>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderContent()}

        {isLoading && agentState.status === 'ANALYZING' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span className="text-blue-700">Analyzing document...</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>

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
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the document or request analysis..."
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
          Upload PDF or text document for AI analysis • Press Enter to send
        </p>
      </div>
    </div>
  );
};

export default AiAssistantPanel;