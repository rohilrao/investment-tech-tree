import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { TechTree } from '@/lib/types';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('tech_tree_db');

    // Fetch nodes and edges from MongoDB
    const nodesCollection = db.collection('nodes');
    const edgesCollection = db.collection('edges');

    const nodes = await nodesCollection.find({}).toArray();
    const edges = await edgesCollection.find({}).toArray();

    // Transform MongoDB documents to match your TechTree type
    const techTree: TechTree = {
      nodes: nodes.map((node) => ({
        id: node.id,
        data: {
          label: node.label,
          nodeLabel: node.type,
          description: node.label,
          detailedDescription: node.description || node.detailedDescription,
          category: node.category,
          subtype: node.subtype,
          trl_current: node.trl_current,
          trl_projected_5_10_years: node.trl_projected_5_10_years,
          references: node.references || [],
        },
      })),
      edges: edges.flatMap((edge) => {
        // Handle both single target and multiple targets
        if (edge.targets && Array.isArray(edge.targets)) {
          return edge.targets.map((target: string, idx: number) => ({
            id: `${edge.id}_${idx}`,
            source: edge.source,
            target: target,
          }));
        }
        return [
          {
            id: edge.id,
            source: edge.source,
            target: edge.target,
          },
        ];
      }),
    };

    return NextResponse.json(techTree);
  } catch (error) {
    console.error('Error fetching tech tree data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech tree data' },
      { status: 500 }
    );
  }
}