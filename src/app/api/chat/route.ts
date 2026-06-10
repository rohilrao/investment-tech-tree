import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part, Content } from '@google/generative-ai';
import { TOPICS, TopicKey } from '@/lib/topicConfig';

// Helper function to convert base64 file data to a generative part
function base64ToGenerativePart(base64Data: string, mimeType: string): Part {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { message, context, history, topic, fileData, mode } = body;

    if (!message && !fileData) {
      return NextResponse.json(
        { error: 'Message or file is required' },
        { status: 400 },
      );
    }

    const topicConfig = TOPICS[topic as TopicKey];
    if (!topicConfig) {
      return NextResponse.json(
        { error: 'Invalid topic' },
        { status: 400 },
      );
    }

    const modelName =
      mode === 'thinking' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Build user parts
    const userParts: Part[] = [{ text: message || '' }];
    if (fileData) {
      userParts.push(
        base64ToGenerativePart(fileData.base64, fileData.mimeType),
      );
    }

    // Build node/edge context
    const nodesContext = (context?.nodes || [])
      .map((node: any) => {
        const references = Array.isArray(node.data.references)
          ? node.data.references
          : [];
        const referencesBlock =
          references.length > 0
            ? `\n      - References:\n${references
                .map((ref: string, i: number) => `        ${i + 1}. ${ref}`)
                .join('\n')}`
            : '';
        return `Node: ${node.data.label} (${node.data.nodeLabel})
      - ID: ${node.id}
      - Category: ${node.data.category || 'N/A'}
      - TRL Current: ${node.data.trl_current || 'N/A'}
      - Description: ${
        node.data.detailedDescription ||
        node.data.description ||
        'No description available'
      }${referencesBlock}`;
      })
      .join('\n\n');

    const edgesContext = (context?.edges || [])
      .map((edge: any) => `Edge: ${edge.source} → ${edge.target}`)
      .join('\n');

    const modeInstruction =
      mode === 'instant'
        ? '\n\nBe concise and direct. Give short, focused answers unless the user explicitly asks you to elaborate or go deeper.'
        : '\n\nThis is a deep-analysis request. Think step-by-step, consider nuances, trade-offs, and second-order effects. Provide a thorough, well-structured response.';

    const systemPrompt = `${topicConfig.systemPrompt}${modeInstruction}

Here is the current Tech Tree context for ${topicConfig.label}:

NODES:
${nodesContext}

EDGES (Dependencies):
${edgesContext}

PRESENT YOUR OUTPUT SUGGESTIONS IN THE FOLLOWING FORMAT:

<h2 class="text-xl font-semibold mb-4 text-gray-900">Analysis Results</h2>
<p class="mb-4 text-gray-700 leading-relaxed">Your introduction paragraph here...</p>

<h3 class="text-lg font-medium mb-3 mt-6 text-gray-800">Suggested Additions</h3>
<ul class="list-disc list-inside mb-4 space-y-3 text-gray-700">
  <li class="mb-2">
    <strong>Technology Name:</strong>
    <p class="ml-6 mt-1">Description of the technology...</p>
    <p class="ml-6 mt-1"><strong>TRL Current:</strong> 3-4</p>
    <p class="ml-6 mt-1"><strong>Dependencies:</strong> node_id_1, node_id_2</p>
  </li>
</ul>

<h3 class="text-lg font-medium mb-3 mt-6 text-gray-800">Technical Explanations</h3>
<ul class="list-disc list-inside mb-4 space-y-2 text-gray-700">
  <li><strong>Term:</strong> Definition and explanation...</li>
</ul>

Remember: Format everything as HTML with proper tags and spacing. No plain text or markdown formatting.`;

    const conversationHistory: Content[] = (history || []).map((msg: any) => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const contents: Content[] = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...conversationHistory,
      { role: 'user', parts: userParts },
    ];

    const result = await model.generateContent({
      contents,
      generationConfig: { temperature: 0.3 },
    });

    return NextResponse.json({ response: result.response.text() });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate response',
      },
      { status: 500 },
    );
  }
}