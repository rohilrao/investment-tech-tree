import { MongoClient, Db } from 'mongodb';

export async function setupAgentCollections(db: Db) {
  // Agent Sessions Collection
  const agentSessions = db.collection('agent_sessions');
  
  // Create TTL index for automatic cleanup (1 hour)
  await agentSessions.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );
  
  // Create index on conversationId for fast lookups
  await agentSessions.createIndex(
    { conversationId: 1 },
    { unique: true }
  );
  
  return { agentSessions };
}

// Helper functions for session management
export async function createAgentSession(
  db: Db,
  conversationId: string,
  initialMessage: string
): Promise<AgentSessionState> {
  const now = new Date();
  const session: AgentSessionState = {
    conversationId,
    chatHistory: [{
      role: 'user',
      content: initialMessage,
      timestamp: now.getTime()
    }],
    currentStep: 'analysis',
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
  };
  
  await db.collection('agent_sessions').insertOne(session);
  return session;
}

export async function getAgentSession(
  db: Db,
  conversationId: string
): Promise<AgentSessionState | null> {
  return await db.collection('agent_sessions').findOne({ conversationId });
}

export async function updateAgentSession(
  db: Db,
  conversationId: string,
  updates: Partial<AgentSessionState>
): Promise<void> {
  await db.collection('agent_sessions').updateOne(
    { conversationId },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    }
  );
}