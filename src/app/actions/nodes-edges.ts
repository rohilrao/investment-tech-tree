'use server';

import { convertDbNodeToUiNode, readQuery } from '@/lib/neo4j';
import { Neo4jTriple, QueryType, UiNode } from '@/lib/types';
import { Edge } from '@xyflow/react';
import { format } from 'date-fns';

export async function getNodesAndEdges(): Promise<{
  nodes: UiNode[];
  edges: Edge[];
}> {
  const result = (await readQuery(
    QueryType.GET_NODES_AND_EDGES,
  )) as Array<Neo4jTriple>;

  const nodesMap = new Map<string, UiNode>();
  const edges: Edge[] = [];

  result.forEach((record) => {
    const sourceNode = record.source;
    if (sourceNode && !nodesMap.has(sourceNode.elementId)) {
      nodesMap.set(sourceNode.elementId, convertDbNodeToUiNode(sourceNode));
    }

    const targetNode = record.target;
    const relationship = record.relationship;
    if (relationship && targetNode) {
      edges.push({
        id: relationship.elementId,
        source: sourceNode.elementId,
        target: targetNode.elementId,
        // type: 'smoothstep',
        // label: relationship.type,
      });
    }
  });

  return { nodes: Array.from(nodesMap.values()), edges };
}

export async function exportGraphData(): Promise<{
  file: Blob;
  fileName: string;
}> {
  try {
    const fileName = `tech-tree-${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.dump`;
    const dumpData = await readQuery(QueryType.EXPORT, { fileName });
    const file = new Blob([JSON.stringify(dumpData[0].data, null, 2)], {
      type: 'application/octet-stream',
    });

    return { file, fileName };
  } catch (err) {
    console.error('Error while exporting graph:');
    throw err;
  }
}
