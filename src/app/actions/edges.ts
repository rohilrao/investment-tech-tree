'use server';

import { writeQuery } from '@/lib/neo4j';
import { QueryType, RETURNED_ID_ALIAS } from '@/lib/types';
import { Edge } from '@xyflow/react';

export async function createEdge(
  sourceId: string,
  targetId: string,
  label = 'INCLUDES', // until now it's always 'INCLUDES'
): Promise<Edge> {
  const result = await writeQuery(QueryType.CREATE_EDGE, {
    sourceId,
    targetId,
  }, label);

  return {
    id: result[0][RETURNED_ID_ALIAS],
    source: sourceId,
    target: targetId,
  };
}

export async function deleteEdge(
  sourceId: string,
  targetId: string,
): Promise<void> {
  await writeQuery(QueryType.DELETE_EDGE, { sourceId, targetId });
}
