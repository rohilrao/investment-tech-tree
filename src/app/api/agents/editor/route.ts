// src/app/api/agents/editor/route.ts

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { TechTreeAgentSystem } from '@/lib/agent-system';
import {
  createAgentSession,
  getAgentSession,
  updateAgentSession,
  setupAgentCollections
} from '@/lib/mongodb-schemas';
import {
  AgentApiResponse,
} from '@/lib/agent-types';

// Simple ID generator (no nanoid dependency needed)
function generateId(): string {
  return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Agent API called');
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const {
      conversationId,
      message,
      file,
      userApproval
    } = body;

    console.log('Request params:', { 
      hasConversationId: !!conversationId, 
      hasMessage: !!message, 
      hasFile: !!file,
      hasApproval: !!userApproval 
    });

    // Connect to MongoDB
    let client, db;
    try {
      client = await clientPromise;
      db = client.db('tech_tree_db');
      console.log('MongoDB connected');
    } catch (e) {
      console.error('MongoDB connection error:', e);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Ensure collections are set up
    try {
      await setupAgentCollections(db);
      console.log('Collections setup complete');
    } catch (e) {
      console.error('Collection setup error:', e);
      // Continue anyway - collections might already exist
    }

    // Check API key
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not configured');
      return NextResponse.json(
        { error: 'AI service not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    // Initialize agent system
    let agentSystem;
    try {
      agentSystem = new TechTreeAgentSystem(apiKey, db);
      console.log('Agent system initialized');
    } catch (e) {
      console.error('Agent system initialization error:', e);
      return NextResponse.json(
        { error: 'Failed to initialize AI agent' },
        { status: 500 }
      );
    }

    // Handle new conversation
    if (!conversationId) {
      console.log('Handling new conversation');
      return await handleNewConversation(
        db,
        agentSystem,
        message,
        file
      );
    }

    // Handle existing conversation continuation
    console.log('Handling conversation continuation');
    return await handleConversationContinuation(
      db,
      agentSystem,
      conversationId,
      message,
      userApproval
    );

  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

async function handleNewConversation(
  db: any,
  agentSystem: TechTreeAgentSystem,
  message: string,
  file?: { content: string; filename: string; mimeType: string }
): Promise<NextResponse<AgentApiResponse>> {
  try {
    const conversationId = generateId();
    console.log('Creating new session:', conversationId);
    
    // Create session
    const session = await createAgentSession(db, conversationId, message);
    console.log('Session created');

    // Store uploaded document if provided
    if (file) {
      await updateAgentSession(db, conversationId, {
        uploadedDocument: file
      });
      session.uploadedDocument = file;
      console.log('File stored in session');
    }

    // Step 1: Analysis
    console.log('Starting analysis...');
    let analysisResult;
    try {
      // Pass the file object directly if it has Base64 flag, otherwise pass content
      const documentToAnalyze = file?.isBase64 
        ? { content: file.content, mimeType: file.mimeType, isBase64: true }
        : (file?.content || message);
        
      analysisResult = await agentSystem.analyzeDocument(
        session,
        documentToAnalyze
      );
      console.log('Analysis complete:', analysisResult);
    } catch (e) {
      console.error('Analysis error:', e);
      return NextResponse.json({
        conversationId,
        status: 'ERROR',
        interruptionType: null,
        uiMessage: `Analysis failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
      });
    }

    await updateAgentSession(db, conversationId, {
      analysisResult,
      currentStep: 'enrichment'
    });

    // Check if document is relevant
    if (!analysisResult.isRelevant) {
      console.log('Document not relevant');
      return NextResponse.json({
        conversationId,
        status: 'COMPLETE',
        interruptionType: null,
        uiMessage: 'The provided content is not relevant to nuclear or fusion energy technology. Please provide information related to reactor concepts, milestones, or enabling technologies in this domain.',
      });
    }

    // Check if enrichment is needed
    if (analysisResult.needsEnrichment) {
      console.log('Enrichment needed, requesting permission');
      return NextResponse.json({
        conversationId,
        status: 'AWAITING_USER_INPUT',
        interruptionType: 'TOOL_CONFIRMATION',
        uiMessage: `I've analyzed your document about ${analysisResult.extractedEntities.join(', ')}. To provide comprehensive suggestions, I'd like to search for additional technical information and recent developments. May I use Google Search?`,
        payload: {
          toolName: 'google_search',
          parameters: {
            topics: analysisResult.extractedEntities
          },
          reasoning: 'Additional research will help ensure accuracy and completeness of the proposed changes.'
        }
      });
    }

    // If no enrichment needed, proceed directly to planning
    console.log('No enrichment needed, proceeding to planning');
    await updateAgentSession(db, conversationId, {
      currentStep: 'planning'
    });

    let plan;
    try {
      plan = await agentSystem.formulatePlan(session);
      console.log('Plan formulated:', plan);
    } catch (e) {
      console.error('Plan formulation error:', e);
      return NextResponse.json({
        conversationId,
        status: 'ERROR',
        interruptionType: null,
        uiMessage: `Failed to create plan: ${e instanceof Error ? e.message : 'Unknown error'}`,
      });
    }

    await updateAgentSession(db, conversationId, {
      proposedPlan: plan,
      currentStep: 'awaiting_approval'
    });

    return NextResponse.json({
      conversationId,
      status: 'AWAITING_USER_INPUT',
      interruptionType: 'PLAN_CONFIRMATION',
      uiMessage: plan.summary,
      payload: plan
    });

  } catch (error) {
    console.error('Error in handleNewConversation:', error);
    throw error;
  }
}

async function handleConversationContinuation(
  db: any,
  agentSystem: TechTreeAgentSystem,
  conversationId: string,
  message?: string,
  userApproval?: {
    type: 'tool_approval' | 'plan_approval' | 'plan_rejection';
    approvedActions?: string[];
  }
): Promise<NextResponse<AgentApiResponse>> {
  try {
    console.log('Retrieving session:', conversationId);
    const session = await getAgentSession(db, conversationId);

    if (!session) {
      console.error('Session not found:', conversationId);
      return NextResponse.json(
        { error: 'Session not found or expired. Please start a new conversation.' },
        { status: 404 }
      );
    }

    // Add user message to history
    if (message) {
      session.chatHistory.push({
        role: 'user',
        content: message,
        timestamp: Date.now()
      });
    }

    // Handle tool approval
    if (userApproval?.type === 'tool_approval') {
      console.log('Processing tool approval');
      await updateAgentSession(db, conversationId, {
        currentStep: 'enrichment'
      });

      // Step 2: Enrichment with Google Search
      let enrichmentData;
      try {
        enrichmentData = await agentSystem.enrichWithSearch(
          session,
          session.analysisResult?.extractedEntities || []
        );
        console.log('Enrichment complete');
      } catch (e) {
        console.error('Enrichment error:', e);
        return NextResponse.json({
          conversationId,
          status: 'ERROR',
          interruptionType: null,
          uiMessage: `Enrichment failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
        });
      }

      await updateAgentSession(db, conversationId, {
        enrichmentData,
        currentStep: 'planning'
      });

      // Step 3: Plan Formulation
      let plan;
      try {
        plan = await agentSystem.formulatePlan({
          ...session,
          enrichmentData
        });
        console.log('Plan formulated after enrichment');
      } catch (e) {
        console.error('Plan formulation error:', e);
        return NextResponse.json({
          conversationId,
          status: 'ERROR',
          interruptionType: null,
          uiMessage: `Failed to create plan: ${e instanceof Error ? e.message : 'Unknown error'}`,
        });
      }

      await updateAgentSession(db, conversationId, {
        proposedPlan: plan,
        currentStep: 'awaiting_approval'
      });

      // Check for deletion notices
      if (plan.deletionNotices && plan.deletionNotices.length > 0) {
        return NextResponse.json({
          conversationId,
          status: 'AWAITING_USER_INPUT',
          interruptionType: 'DELETION_NOTICE',
          uiMessage: `I've completed my analysis. However, I believe some nodes should be deleted. Since I cannot delete nodes automatically, please review these suggestions:\n\n${plan.deletionNotices.map(dn => `• ${dn.nodeId}: ${dn.reasoning}`).join('\n')}`,
          payload: {
            plan: plan.plan,
            deletionNotices: plan.deletionNotices
          }
        });
      }

      return NextResponse.json({
        conversationId,
        status: 'AWAITING_USER_INPUT',
        interruptionType: 'PLAN_CONFIRMATION',
        uiMessage: plan.summary,
        payload: plan
      });
    }

    // Handle plan approval
    if (userApproval?.type === 'plan_approval') {
      const approvedActions = userApproval.approvedActions || [];
      
      return NextResponse.json({
        conversationId,
        status: 'COMPLETE',
        interruptionType: null,
        uiMessage: `Thank you! ${approvedActions.length} action(s) are ready to be executed. Click the "Execute" buttons on each approved suggestion to apply the changes.`,
        payload: {
          approvedActions
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid request - missing approval type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in handleConversationContinuation:', error);
    throw error;
  }
}