// src/lib/agent-system.ts
// Updated with document chunking for large files

import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { Db } from 'mongodb';
import { AgentTools } from './agent-tools';
import {
  AgentSessionState,
  AgentAction,
  AgentActionPlan,
} from './agent-types';

// Token limits for Gemini models
const MODEL_TOKEN_LIMITS = {
  'gemini-1.5-flash-latest': 1048576,
  'gemini-1.5-pro-latest': 1048576,
};

// ... (chunkText and estimateTokens functions remain the same) ...

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3);
}

// Chunk text into smaller pieces
function chunkText(text: string, maxTokens: number): string[] {
  const maxChars = maxTokens * 4; // Approximate characters per chunk
  const chunks: string[] = [];
  
  // Try to split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 < maxChars) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // If single paragraph is too large, split by sentences
      if (paragraph.length > maxChars) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        let sentenceChunk = '';
        
        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length < maxChars) {
            sentenceChunk += sentence;
          } else {
            if (sentenceChunk) {
              chunks.push(sentenceChunk);
            }
            sentenceChunk = sentence;
          }
        }
        
        if (sentenceChunk) {
          currentChunk = sentenceChunk;
        }
      } else {
        currentChunk = paragraph;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}


export class TechTreeAgentSystem {
  private genAI: GoogleGenerativeAI;
  private tools: AgentTools;
  private modelName = 'gemini-2.0-flash';

  constructor(
    apiKey: string,
    private db: Db
  ) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.tools = new AgentTools(db);
  }

  /**
   * Step 1: Analysis Agent with chunking support
   */
  async analyzeDocument(
    session: AgentSessionState,
    document: string | { content: string; mimeType: string; isBase64: boolean }
  ): Promise<{
    isRelevant: boolean;
    summary: string;
    extractedEntities: string[];
    needsEnrichment: boolean;
  }> {
    console.log('Starting document analysis...');
    
    const techTreeContext = await this.getTechTreeContext();
    
    // If document is an object, it's a file. We handle it directly.
    if (typeof document === 'object' && document.isBase64) {
        console.log('Processing Base64 encoded file directly.');
        // For now, we assume PDF/binary files won't be chunked and will fit.
        // A more robust solution might check token size of a text representation if possible,
        // but for direct file analysis, we pass it whole.
        return await this.analyzeDocumentSingle(document, techTreeContext);
    }
    
    // If document is text, check for chunking
    const documentContent = typeof document === 'string' ? document : document.content;
    const contextTokens = estimateTokens(techTreeContext);
    const documentTokens = estimateTokens(documentContent);
    
    console.log('Estimated tokens - Context:', contextTokens, 'Document:', documentTokens);

    const maxInputTokens = MODEL_TOKEN_LIMITS[this.modelName] || 1000000;
    const reservedTokens = contextTokens + 5000; // Context + prompt + response buffer
    const availableTokens = maxInputTokens - reservedTokens;
    
    console.log('Available tokens for document:', availableTokens);

    if (documentTokens > availableTokens) {
      console.log('Document too large, using chunked processing for text');
      return await this.analyzeDocumentChunked(documentContent, techTreeContext, availableTokens);
    }
    
    return await this.analyzeDocumentSingle(documentContent, techTreeContext);
  }

  /**
   * Analyze document in a single request - NOW HANDLES FILE OBJECTS
   */
  private async analyzeDocumentSingle(
    document: string | { content: string; mimeType: string; isBase64: boolean },
    techTreeContext: string
  ): Promise<{
    isRelevant: boolean;
    summary: string;
    extractedEntities: string[];
    needsEnrichment: boolean;
  }> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    const promptText = `You are an expert analyst for a nuclear and fusion energy technology tree.

TASK: Analyze the provided document and determine:
1. Is it relevant to nuclear or fusion energy technology, concepts, or milestones?
2. What are the key technologies, reactor concepts, or milestones mentioned?
3. Does the information seem novel or require cross-referencing with external sources for validation?

Respond ONLY with a single, valid JSON object in the following format:
{
  "isRelevant": boolean,
  "summary": "A brief summary of the document's main points (2-3 sentences).",
  "extractedEntities": ["list", "of", "key entities"],
  "needsEnrichment": boolean
}`;
    
    const parts: Part[] = [{ text: promptText }];

    // Check if the document is a file object or plain text
    if (typeof document === 'object' && document.isBase64) {
      console.log(`Adding file part with mimeType: ${document.mimeType}`);
      parts.push({
        inlineData: {
          mimeType: document.mimeType,
          data: document.content // This is the base64 string
        }
      });
    } else {
      // It's a text string
      const content = typeof document === 'string' ? document : document.content;
      parts.push({ text: `\n\nDOCUMENT TO ANALYZE:\n\`\`\`\n${content}\n\`\`\`` });
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    console.log('Analysis response:', responseText.substring(0, 500));
    
    // Since we request JSON directly, we can parse it
    try {
        const response = JSON.parse(responseText);
        return {
          isRelevant: response.isRelevant || false,
          summary: response.summary || 'No summary available',
          extractedEntities: response.extractedEntities || [],
          needsEnrichment: response.needsEnrichment || false
        };
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", e);
        throw new Error('Failed to parse analysis response from AI model.');
    }
  }
  
  // The rest of the file (analyzeDocumentChunked, enrichWithSearch, formulatePlan, getTechTreeContext)
  // can remain as is, since the chunking logic is text-based and the other functions
  // don't directly handle the initial file upload.
  
  /**
   * Analyze large document by processing chunks and combining results
   */
  private async analyzeDocumentChunked(
    documentContent: string,
    techTreeContext: string,
    availableTokens: number
  ): Promise<{
    isRelevant: boolean;
    summary: string;
    extractedEntities: string[];
    needsEnrichment: boolean;
  }> {
    console.log('Processing document in chunks...');
    
    // Split document into manageable chunks
    const chunks = chunkText(documentContent, availableTokens);
    console.log(`Split into ${chunks.length} chunks`);
    
    const model = this.genAI.getGenerativeModel({
      model: this.modelName
    });

    // Process each chunk
    const chunkResults: Array<{
      isRelevant: boolean;
      summary: string;
      extractedEntities: string[];
    }> = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
      
      const prompt = `You are analyzing chunk ${i + 1} of ${chunks.length} from a larger document about potential nuclear/fusion energy technology.

TASK: Extract key information from this chunk:
1. Is this chunk relevant to nuclear or fusion energy?
2. What technologies, concepts, or milestones are mentioned?
3. Brief summary of this chunk's content

DOCUMENT CHUNK ${i + 1}:
${chunks[i]}

Respond in JSON format:
{
  "isRelevant": boolean,
  "summary": "1-2 sentence summary of this chunk",
  "extractedEntities": ["entity1", "entity2", ...]
}`;

      try {
        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        });

        const responseText = result.response.text();
        const chunkResult = JSON.parse(responseText);
        chunkResults.push(chunkResult);
        
        // Rate limiting: wait between chunks
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (e) {
        console.error(`Error processing chunk ${i + 1}:`, e);
        // Continue with other chunks
      }
    }

    // Combine results from all chunks
    const isRelevant = chunkResults.some(r => r.isRelevant);
    const allEntities = Array.from(
      new Set(chunkResults.flatMap(r => r.extractedEntities))
    );
    const combinedSummary = chunkResults
      .filter(r => r.isRelevant)
      .map(r => r.summary)
      .join(' ');

    console.log('Chunk analysis complete:', {
      relevantChunks: chunkResults.filter(r => r.isRelevant).length,
      totalEntities: allEntities.length
    });

    // Final synthesis to create coherent summary and determine if enrichment needed
    if (isRelevant && allEntities.length > 0) {
      console.log('Creating final synthesis...');
      
      try {
        const synthesisPrompt = `Based on analysis of a large document, here are the key findings:

EXTRACTED ENTITIES: ${allEntities.join(', ')}

CHUNK SUMMARIES:
${combinedSummary}

TECH TREE CONTEXT (sample):
${techTreeContext.split('\n').slice(0, 30).join('\n')}

TASK:
1. Create a coherent 2-3 sentence summary of the document
2. Determine if we need to search for additional information about these entities
3. Check if any entities might duplicate existing tech tree nodes

Respond in JSON format:
{
  "summary": "Coherent summary combining all chunks",
  "needsEnrichment": boolean,
  "potentialDuplicates": ["existing_node_id1", ...]
}`;

        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: synthesisPrompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          }
        });

        const responseText = result.response.text();
        const synthesis = JSON.parse(responseText);
          
        return {
            isRelevant: true,
            summary: synthesis.summary || combinedSummary.substring(0, 500),
            extractedEntities: allEntities,
            needsEnrichment: synthesis.needsEnrichment || false
        };
      } catch (e) {
        console.error('Synthesis error:', e);
      }
    }

    return {
      isRelevant,
      summary: combinedSummary.substring(0, 500) || 'Document processed in chunks',
      extractedEntities: allEntities,
      needsEnrichment: allEntities.length > 0
    };
  }

  /**
   * Step 2: Enrichment Agent
   */
  async enrichWithSearch(
    session: AgentSessionState,
    searchTopics: string[]
  ): Promise<Record<string, unknown>> {
    console.log('Enrichment step - simulated for now');
    
    const enrichmentData: Record<string, unknown> = {};
    
    for (const topic of searchTopics.slice(0, 5)) { // Limit to 5 topics
      enrichmentData[topic] = {
        note: 'Enrichment data would be gathered here',
        topic: topic
      };
    }

    return enrichmentData;
  }

  /**
   * Step 3: Plan Formulation Agent
   */
  async formulatePlan(
    session: AgentSessionState
  ): Promise<AgentActionPlan> {
    console.log('Formulating plan...');
    
    const model = this.genAI.getGenerativeModel({
      model: this.modelName
    });

    const techTreeContext = await this.getTechTreeContext();

    const prompt = `You are creating an action plan for a nuclear/fusion tech tree.

RULES:
1. You can propose: ADD_NODE, UPDATE_NODE, ADD_EDGE
2. NO deletion - if deletion needed, mention in summary
3. Use unique IDs for new nodes (check existing IDs carefully)
4. Only propose 3-5 actions maximum
5. Focus on the most important changes

CURRENT TECH TREE (sample):
${techTreeContext.split('\n').slice(0, 60).join('\n')}

ANALYSIS SUMMARY:
${session.analysisResult?.summary}

EXTRACTED ENTITIES:
${session.analysisResult?.extractedEntities.join(', ')}

Create a focused action plan with 3-5 high-priority actions. Respond in JSON:
{
  "plan": [
    {
      "action": "ADD_NODE",
      "payload": {
        "id": "unique_id_check_existing",
        "label": "Node Label",
        "type": "Milestone",
        "category": "Category",
        "trl_current": "3-4",
        "detailedDescription": "Detailed description",
        "references": ["url1", "url2"]
      },
      "reasoning": "Why this is needed"
    }
  ],
  "summary": "Brief summary of proposed changes"
}`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    console.log('Plan response:', responseText.substring(0, 500));
    
    const rawPlan = JSON.parse(responseText);

    // Validate each action
    const validatedActions: AgentAction[] = [];
    
    if (rawPlan.plan && Array.isArray(rawPlan.plan)) {
      for (const action of rawPlan.plan) {
        try {
          const validationResult = await this.tools.validateChange(action);
          
          validatedActions.push({
            ...action,
            validationResult
          });
          
          if (validationResult.isValid) {
            console.log('✓ Action validated:', action.action, action.payload.id || action.payload.nodeId);
          } else {
            console.log('✗ Action validation failed:', validationResult.reason);
          }
        } catch (e) {
          console.error('Validation error:', e);
        }
      }
    }

    return {
      plan: validatedActions,
      summary: rawPlan.summary || 'Plan created from document analysis',
      deletionNotices: []
    };
  }

  /**
   * Get current tech tree context (optimized to reduce tokens)
   */
  private async getTechTreeContext(): Promise<string> {
    try {
      // Limit to 100 nodes for context
      const nodes = await this.db.collection('nodes')
        .find({})
        .project({ id: 1, label: 1, type: 1 })
        .limit(100)
        .toArray();

      const nodesContext = nodes
        .map(node => `${node.id}: ${node.label} (${node.type})`)
        .join('\n');

      return `EXISTING NODES:\n${nodesContext}`;
    } catch (e) {
      console.error('Error fetching tech tree context:', e);
      return 'NODES:\n(Unable to fetch)';
    }
  }
}