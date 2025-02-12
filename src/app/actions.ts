'use server';

import { readQuery, writeQuery } from '@/lib/neo4j';
import { createEmbedding } from '@/lib/rag';
import { LABEL_COLORS, Neo4jTriple, NodeLabel, UiNode } from '@/lib/types';
import { Edge } from '@xyflow/react';

export async function getNodesAndEdges(): Promise<{
  nodes: UiNode[];
  edges: Edge[];
}> {
  try {
    const result = (await readQuery(
      'MATCH (source) OPTIONAL MATCH (source)-[relationship]->(target) RETURN source, relationship, target',
    )) as Array<Neo4jTriple>;

    const nodesMap = new Map<string, UiNode>();
    const edges: Edge[] = [];

    result.forEach((record) => {
      const node = record.source;
      if (node && !nodesMap.has(node.identity.toString())) {
        nodesMap.set(node.identity.toString(), {
          id: node.identity.toString(),
          data: {
            label: node.properties.name,
            description: node.properties.description,
            nodeLabel: node.labels[0] as NodeLabel,
          },
          position: {
            x: node.properties.x as number,
            y: node.properties.y as number,
          },
          width: node.properties.width as number,
          height: node.properties.height as number,
          className: `border-${LABEL_COLORS[node.labels[0] as NodeLabel]}`,
          type: 'custom',
        });
      }

      const targetNode = record.target;
      const relationship = record.relationship;
      if (relationship && targetNode) {
        edges.push({
          id: relationship.identity.toString(),
          source: relationship.start.toString(),
          target: relationship.end.toString(),
          // type: 'smoothstep',
          // label: relationship.type,
        });
      }
    });

    return { nodes: Array.from(nodesMap.values()), edges };
  } catch (error) {
    throw new Error('Failed to get edges & nodes from server', {
      cause: error,
    });
  }
}

export async function createNode({
  data: { label, description, nodeLabel },
  position: { x, y },
}: UiNode): Promise<UiNode> {
  try {
    const NEW_NODE_ALIAS = 'newNode';
    const embedding = await createEmbedding(description);

    const result = await writeQuery(
      `CREATE (n {name: $label, description: $description, x: $x, y: $y, embedding: $embedding}) SET n:${nodeLabel} RETURN n as ${NEW_NODE_ALIAS}`,
      { label, description, x, y, embedding },
    );

    const node = result[0][NEW_NODE_ALIAS];

    return {
      id: node.identity.toString(),
      data: {
        label: node.properties.name as string,
        nodeLabel: node.labels[0] as NodeLabel,
        description: node.properties.description as string,
      },
      position: { x: node.properties.x, y: node.properties.y },
      type: 'custom',
      className: `border-${LABEL_COLORS[node.labels[0] as NodeLabel]}`,
    };
  } catch (error) {
    throw new Error('Failed to create node', { cause: error });
  }
}

// TODO: combine all nodeUpdaters in one function
export async function updateNode(
  id: string,
  name: string,
  label: NodeLabel,
  description: string,
  descriptionChanged: boolean,
): Promise<UiNode> {
  try {
    const NODE_ALIAS = 'updatedNode';
    let embedding = null;

    if (descriptionChanged) {
      embedding = await createEmbedding(description);
    }

    const query = `
      MATCH (n) WHERE id(n) = toInteger($id)
      WITH n, labels(n) AS oldLabels
      CALL {
        WITH n, oldLabels
        UNWIND oldLabels AS oldLabel
        CALL apoc.create.removeLabels(n, [oldLabel]) YIELD node
        RETURN node
      }
      SET n.name = $name, n.description = $description
          ${descriptionChanged ? ',n.embedding = $embedding' : ''}
      SET n:${label}
      RETURN n AS ${NODE_ALIAS}
    `;

    const params: Record<string, unknown> = { id, name, description };
    if (descriptionChanged) {
      params.embedding = embedding;
    }

    const result = await writeQuery(query, params);
    const node = result[0][NODE_ALIAS];

    return {
      id: node.identity.toString(),
      data: {
        ...node.properties,
        label: node.properties.name,
        nodeLabel: node.labels[0] as NodeLabel,
      },
      position: { x: node.properties.x, y: node.properties.y },
      className: `border-${LABEL_COLORS[node.labels[0] as NodeLabel]}`,
    };
  } catch (error) {
    throw new Error('Failed to update node', { cause: error });
  }
}

export async function updateNodePosition(
  id: string,
  x: number,
  y: number,
): Promise<UiNode> {
  try {
    const NODE_ALIAS = 'updatedNode';

    const query = `
      MATCH (n) WHERE id(n) = toInteger($id)
      SET n.x = $x, n.y = $y
      RETURN n AS ${NODE_ALIAS}
    `;

    const params: Record<string, unknown> = { id, x, y };

    const result = await writeQuery(query, params);
    const node = result[0][NODE_ALIAS];

    return {
      id: node.identity.toString(),
      data: node.properties,
      position: { x: node.properties.x, y: node.properties.y },
    };
  } catch (error) {
    throw new Error('Failed to update node position', { cause: error });
  }
}

export async function updateNodeSize(
  id: string,
  width: number,
  height: number,
): Promise<UiNode> {
  try {
    const NODE_ALIAS = 'updatedNode';

    const query = `
      MATCH (n) WHERE id(n) = toInteger($id)
      SET n.width = $width, n.height = $height
      RETURN n AS ${NODE_ALIAS}
    `;

    const params: Record<string, unknown> = { id, width, height };

    const result = await writeQuery(query, params);
    const node = result[0][NODE_ALIAS];

    return {
      id: node.identity.toString(),
      data: node.properties,
      position: { x: node.properties.x, y: node.properties.y },
      width: node.properties.width,
      height: node.properties.height,
    };
  } catch (error) {
    throw new Error('Failed to update node size', { cause: error });
  }
}

export async function deleteNode(id: string) {
  try {
    await writeQuery('MATCH (n) WHERE ID(n) = $id DETACH DELETE n', {
      id: Number(id),
    });
  } catch (error) {
    throw new Error('Failed to delete node', { cause: error });
  }
}

export async function createRelationship(
  source: number,
  target: number,
): Promise<Edge> {
  try {
    const ID_ALIAS = 'id';
    const LABEL = 'CONNECTED_TO';
    const result = await writeQuery(
      `MATCH (a), (b) 
       WHERE ID(a) = $source AND ID(b) = $target 
       CREATE (a)-[r:${LABEL}]->(b) 
       RETURN ID(r) AS ${ID_ALIAS}`,
      { source, target },
    );

    return {
      id: result[0][ID_ALIAS].toNumber().toString(),
      source: source.toString(),
      target: target.toString(),
      // type: 'smoothstep',
      // label: LABEL,
    };
  } catch (error) {
    throw new Error('Failed to create relationship', { cause: error });
  }
}

export async function deleteRelationship(fromId: number, toId: number) {
  try {
    await writeQuery(
      'MATCH (a)-[r]->(b) WHERE ID(a) = $fromId AND ID(b) = $toId DELETE r',
      { fromId, toId },
    );
  } catch (error) {
    throw new Error('Failed to delete relationship', { cause: error });
  }
}
