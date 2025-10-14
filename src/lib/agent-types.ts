export type AgentStatus = 'ANALYZING' | 'AWAITING_USER_INPUT' | 'COMPLETE' | 'ERROR';
export type InterruptionType = 'TOOL_CONFIRMATION' | 'PLAN_CONFIRMATION' | 'DELETION_NOTICE' | null;

export interface AgentApiResponse {
  conversationId: string;
  status: AgentStatus;
  interruptionType: InterruptionType;
  uiMessage: string;
  payload?: AgentActionPlan | ToolRequest | DeletionNotice;
  chatHistory?: AgentMessage[];
}

export interface AgentMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
}

export type AgentActionType = 'ADD_NODE' | 'ADD_EDGE' | 'UPDATE_NODE';

export interface AgentAction {
  action: AgentActionType;
  payload: {
    // For ADD_NODE
    id?: string;
    label?: string;
    type?: string;
    category?: string;
    trl_current?: string;
    detailedDescription?: string;
    references?: string[];
    
    // For ADD_EDGE
    source?: string;
    target?: string;
    
    // For UPDATE_NODE
    nodeId?: string;
    updates?: Record<string, unknown>;
  };
  reasoning: string;
  validationResult?: ValidationResult;
}

export interface AgentActionPlan {
  plan: AgentAction[];
  summary: string;
}

export interface ToolRequest {
  toolName: 'google_search' | 'validateChange';
  parameters: Record<string, unknown>;
  reasoning: string;
}

export interface DeletionNotice {
  nodeId: string;
  reasoning: string;
  manualSteps: string[];
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  suggestions?: string[];
}

export interface AgentSessionState {
  conversationId: string;
  chatHistory: AgentMessage[];
  currentStep: 'analysis' | 'enrichment' | 'planning' | 'awaiting_approval';
  uploadedDocument?: {
    filename: string;
    content: string;
    mimeType: string;
  };
  analysisResult?: {
    isRelevant: boolean;
    summary: string;
    extractedEntities: string[];
  };
  enrichmentData?: Record<string, unknown>;
  proposedPlan?: AgentActionPlan;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}