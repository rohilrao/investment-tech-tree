'use server'

import {session} from '@/libs/neo4j';
import {EdgeProps, SkillTreeNodeNeo} from '@/libs/types';
import {revalidatePath} from "next/cache";
import {Edge} from "reactflow";
import neo4j from "neo4j-driver";

export async function getTechnologies() {
    try {
        const result = await session.run(
            'MATCH (n:Technology) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m'
        );

        const nodesMap = new Map<string, SkillTreeNodeNeo>();
        const edges: EdgeProps[] = [];

        result.records.forEach((record) => {
            const node = record.get('n');
            if (node && !nodesMap.has(node.identity.toString())) {
                nodesMap.set(node.identity.toString(), {
                    id: node.identity.toString(),
                    data: { label: node.properties.name, level: node.properties.level },
                    position: { x: node.properties.x, y: node.properties.y },
                });
            }

            const targetNode = record.get('m');
            const edge = record.get('r');
            if (edge && targetNode) {
                edges.push({
                    id: edge.identity.toString(),
                    source: edge.start.toString(),
                    target: edge.end.toString(),
                    type: edge.type,
                });
            }
        });

        return { nodes: Array.from(nodesMap.values()), edges };
    } catch (error) {
        throw new Error((error as Error).message);
    }
}

export async function createTechnology(name: string, level: number, x: number, y: number): Promise<SkillTreeNodeNeo> {
    try {
        if (!name) {
            throw new Error('Name is required');
        }

        const result = await session.run(
            'CREATE (n:Technology {name: $name, level: $level, x: $x, y:$y}) RETURN n',
            { name, level, x, y }
        );
        const node = result.records[0].get('n');

        revalidatePath('/tech-tree');

        return {
            id: node.identity.toString(),
            data: { label: node.properties.name, level: node.properties.level },
            position: { x: node.properties.x, y: node.properties.y },
        };
    } catch (error) {
        throw new Error((error as Error).message);
    }
}

export async function deleteTechnology(id: string) {
    try {
        await session.run(
            'MATCH (n:Technology) WHERE ID(n) = $id DETACH DELETE n',
            { id: Number(id) }
        );
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function createRelationship(source: number, target: number): Promise<{edge?: Edge, status: number, error?: string}> {
    if (!source || !target) {
        return { error: 'Missing parameters', status: 400 };
    }

    try {
        const result = await session.run(
            `MATCH (a:Technology), (b:Technology) 
       WHERE ID(a) = $source AND ID(b) = $target 
       CREATE (a)-[r:RELATIONSHIP]->(b) 
       RETURN ID(r) AS id, ID(a) AS source, ID(b) AS target`,
            { source, target }
        );


        const record = result.records[0];
        if (!record) {
            return { error: 'Failed to create relationship', status: 500 };
        }

        const newEdge = {
            id: (record.get('id')).toNumber(),
            source: (record.get('source')).toNumber(),
            target: (record.get('target')).toNumber(),
        };

        if (!newEdge) {
            return { error: 'Failed to create relationship', status: 500 };
        }

        return { edge: newEdge as Edge, status: 201 };
    } catch (error) {
        return { error: error.message, status: 500 };
    }
}

export async function deleteRelationship(fromId: number, toId: number): Promise<{error?: string, message?: string, status: number}> {
    if (!fromId || !toId) {
        return { error: 'Missing fromId or toId', status: 400 };
    }

    try {
        await session.run(
            'MATCH (a)-[r]->(b) WHERE ID(a) = $fromId AND ID(b) = $toId DELETE r',
            { fromId, toId }
        );

        return { message: 'Relationship deleted', status: 204 };
    } catch (error) {
        return { error: error.message, status: 500 };
    }
}