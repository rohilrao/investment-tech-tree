import neo4j, { RecordShape } from 'neo4j-driver';
import { QUERIES } from './queries';
import { DbNode, LABEL_COLORS, NodeLabel, QueryType, UiNode } from './types';

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
);

export async function readQuery(
  queryType: QueryType,
  params: Record<string, unknown> = {},
  label?: string,
): Promise<RecordShape[]> {
  const session = driver.session();

  try {
    const res = await session.executeRead((tx) =>
      tx.run(QUERIES[queryType](label), params),
    );
    return res.records.map((record) => record.toObject());
  } finally {
    await session.close();
  }
}

export async function writeQuery(
  queryType: QueryType,
  params = {},
  label?: string,
): Promise<RecordShape[]> {
  const session = driver.session();

  try {
    const res = await session.executeWrite((tx) =>
      tx.run(QUERIES[queryType](label), params),
    );
    return res.records.map((record) => record.toObject());
  } catch (err) {
    console.error(`Error during writeQuery for queryType ${queryType}:`);
    throw err;
  } finally {
    await session.close();
  }
}

export const convertDbNodeToUiNode = (dbNode: DbNode): UiNode => ({
  id: dbNode.elementId,
  data: {
    label: dbNode.properties.name as string,
    description: dbNode.properties.description as string,
    nodeLabel: dbNode.labels[0] as NodeLabel,
  },
  position: {
    x: dbNode.properties.x as number,
    y: dbNode.properties.y as number,
  },
  width: dbNode.properties.width as number,
  height: dbNode.properties.height as number,
  className: `border-${LABEL_COLORS[dbNode.labels[0] as NodeLabel]}`,
  type: 'custom',
});
