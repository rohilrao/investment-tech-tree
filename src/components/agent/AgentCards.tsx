// src/components/agent/AgentCards.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search,
  Trash2,
  Info,
  Plus,
  Edit,
  Link
} from 'lucide-react';
import { 
  AgentAction, 
  ToolRequest, 
  DeletionNotice 
} from '@/lib/agent-types';

// Tool Confirmation Card
interface ToolConfirmationCardProps {
  toolRequest: ToolRequest;
  onApprove: () => void;
  onDeny: () => void;
}

export const ToolConfirmationCard: React.FC<ToolConfirmationCardProps> = ({
  toolRequest,
  onApprove,
  onDeny
}) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-blue-600" />
          Permission Required: Google Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            {toolRequest.reasoning}
          </p>
          
          <div className="bg-white p-3 rounded border">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Search Topics:
            </p>
            <div className="flex flex-wrap gap-2">
              {(toolRequest.parameters.topics as string[]).map((topic, idx) => (
                <Badge key={idx} variant="outline">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onDeny}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Deny
          </Button>
          <Button
            onClick={onApprove}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Suggestion Card for individual actions
interface SuggestionCardProps {
  action: AgentAction;
  index: number;
  onAccept: () => void;
  onReject: () => void;
  isAccepted?: boolean;
  isRejected?: boolean;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  action,
  index,
  onAccept,
  onReject,
  isAccepted,
  isRejected
}) => {
  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'ADD_NODE': return 'bg-green-50 border-green-200';
      case 'UPDATE_NODE': return 'bg-yellow-50 border-yellow-200';
      case 'ADD_EDGE': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'ADD_NODE': return <Plus className="h-5 w-5 text-green-600" />;
      case 'UPDATE_NODE': return <Edit className="h-5 w-5 text-yellow-600" />;
      case 'ADD_EDGE': return <Link className="h-5 w-5 text-blue-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'ADD_NODE': return 'Add Node';
      case 'UPDATE_NODE': return 'Update Node';
      case 'ADD_EDGE': return 'Add Edge';
      default: return actionType;
    }
  };

  return (
    <Card className={`${getActionColor(action.action)} ${isAccepted ? 'opacity-75 ring-2 ring-green-400' : ''} ${isRejected ? 'opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {getActionIcon(action.action)}
            <span>Suggestion #{index + 1}: {getActionLabel(action.action)}</span>
          </div>
          {action.validationResult?.isValid && (
            <Badge variant="outline" className="bg-white">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Validated
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Details */}
        <div className="bg-white p-4 rounded border space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">ACTION TYPE</p>
            <p className="text-sm font-medium">{getActionLabel(action.action)}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">DATA</p>
            <div className="space-y-1">
              {Object.entries(action.payload).map(([key, value]) => {
                if (!value) return null;
                
                return (
                  <div key={key} className="text-sm">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                    <span className="text-gray-700">
                      {Array.isArray(value) 
                        ? value.length > 0 
                          ? value.join(', ') 
                          : 'None'
                        : typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">REASONING</p>
            <p className="text-sm text-gray-700">{action.reasoning}</p>
          </div>

          {/* Validation warnings if any */}
          {action.validationResult && !action.validationResult.isValid && (
            <div className="bg-red-50 border border-red-200 p-3 rounded">
              <p className="text-xs font-semibold text-red-700 mb-1">
                ⚠️ VALIDATION WARNING
              </p>
              <p className="text-sm text-red-600">
                {action.validationResult.reason}
              </p>
              {action.validationResult.suggestions && action.validationResult.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-red-700 mb-1">Suggestions:</p>
                  <ul className="list-disc list-inside text-xs text-red-600">
                    {action.validationResult.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isAccepted && !isRejected && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onReject}
              className="gap-2"
              size="sm"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={onAccept}
              className="gap-2 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Accept & Execute
            </Button>
          </div>
        )}

        {isAccepted && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Accepted - Ready to Execute
          </div>
        )}

        {isRejected && (
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <XCircle className="h-4 w-4" />
            Rejected
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Deletion Notice Card (non-interactive)
interface DeletionNoticeCardProps {
  notice: DeletionNotice;
}

export const DeletionNoticeCard: React.FC<DeletionNoticeCardProps> = ({
  notice
}) => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-red-700">
          <Trash2 className="h-5 w-5" />
          Manual Deletion Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">NODE ID</p>
            <p className="text-sm font-medium font-mono bg-white px-2 py-1 rounded border">
              {notice.nodeId}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">REASONING</p>
            <p className="text-sm text-gray-700">{notice.reasoning}</p>
          </div>

          <div className="bg-white p-3 rounded border">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              MANUAL STEPS REQUIRED:
            </p>
            <ol className="list-decimal list-inside space-y-1">
              {notice.manualSteps.map((step, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-yellow-800 mb-1">
                Important Safety Note
              </p>
              <p className="text-xs text-yellow-700">
                As a safety measure, node deletion must be performed manually in the 
                "Edit Tech Tree" panel. The AI agent cannot delete nodes automatically 
                to prevent accidental data loss.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Plan Summary Card
interface PlanSummaryCardProps {
  summary: string;
  totalActions: number;
  deletionNotices?: number;
}

export const PlanSummaryCard: React.FC<PlanSummaryCardProps> = ({
  summary,
  totalActions,
  deletionNotices = 0
}) => {
  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="h-5 w-5 text-purple-600" />
          Analysis Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700">{summary}</p>
        
        <div className="flex flex-wrap gap-2">
          {totalActions > 0 && (
            <Badge variant="outline" className="bg-white border-green-200">
              <Plus className="h-3 w-3 mr-1" />
              {totalActions} Suggestion{totalActions !== 1 ? 's' : ''}
            </Badge>
          )}
          {deletionNotices > 0 && (
            <Badge variant="outline" className="bg-white border-red-200">
              <Trash2 className="h-3 w-3 mr-1" />
              {deletionNotices} Deletion Notice{deletionNotices !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="bg-white p-3 rounded border">
          <p className="text-xs text-gray-600">
            <strong>Instructions:</strong> Review each suggestion below carefully. 
            You can accept individual actions that look correct and reject others. 
            Once you've reviewed all suggestions, click "Execute All" to apply the 
            accepted changes to your tech tree.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading/Processing Card
interface ProcessingCardProps {
  message: string;
  step?: string;
}

export const ProcessingCard: React.FC<ProcessingCardProps> = ({
  message,
  step
}) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">{message}</p>
            {step && (
              <p className="text-xs text-blue-700 mt-1">{step}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Error Card
interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  message,
  onRetry
}) => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 mb-1">Error</p>
            <p className="text-sm text-red-700">{message}</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Success Card
interface SuccessCardProps {
  message: string;
  details?: string[];
}

export const SuccessCard: React.FC<SuccessCardProps> = ({
  message,
  details
}) => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 mb-1">Success</p>
            <p className="text-sm text-green-700">{message}</p>
            {details && details.length > 0 && (
              <ul className="mt-2 space-y-1">
                {details.map((detail, idx) => (
                  <li key={idx} className="text-xs text-green-600">
                    • {detail}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};