'use server';

import { convertDbNodeToUiNode, writeQuery } from '@/lib/neo4j';
import {
  DbNode,
  NodeLabel,
  QueryType,
  RETURNED_NODE_ALIAS,
  UiNode,
} from '@/lib/types';
import { XYPosition } from '@xyflow/react';
import { createEmbedding } from './rag';

export async function createNode({ x, y }: XYPosition): Promise<UiNode> {
  const result = await writeQuery(QueryType.CREATE_NODE, {
    name: 'New Node',
    description: '',
    x,
    y,
    height: 50,
    width: 150,
  });

  return convertDbNodeToUiNode(result[0][RETURNED_NODE_ALIAS] as DbNode);
}

export async function updateNodeContent(
  id: string,
  name: string,
  label: NodeLabel,
  description: string,
): Promise<UiNode> {
  const result = await writeQuery(
    QueryType.UPDATE_NODE_CONTENT,
    {
      id,
      name,
      description,
    },
    label,
  );

  return convertDbNodeToUiNode(result[0][RETURNED_NODE_ALIAS] as DbNode);
}

export async function updateNodeContentAndEmbedding(
  id: string,
  name: string,
  label: NodeLabel,
  description: string,
): Promise<UiNode> {
  const embedding = await createEmbedding(description);

  const result = await writeQuery(
    QueryType.UPDATE_NODE_CONTENT_AND_EMBEDDING,
    {
      id,
      name,
      description,
      embedding,
    },
    label,
  );

  return convertDbNodeToUiNode(result[0][RETURNED_NODE_ALIAS] as DbNode);
}

export async function updateNodePosition(
  id: string,
  x: number,
  y: number,
): Promise<UiNode> {
  const result = await writeQuery(QueryType.UPDATE_NODE_POSITION, {
    id,
    x,
    y,
  });

  return convertDbNodeToUiNode(result[0][RETURNED_NODE_ALIAS] as DbNode);
}

export async function updateNodeSize(
  id: string,
  width: number,
  height: number,
): Promise<UiNode> {
  const result = await writeQuery(QueryType.UPDATE_NODE_SIZE, {
    id,
    width,
    height,
  });

  return convertDbNodeToUiNode(result[0][RETURNED_NODE_ALIAS] as DbNode);
}

export async function deleteNode(id: string) {
  await writeQuery(QueryType.DELETE_NODE, {
    id,
  });
}
