import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
);


export async function readQuery(query: string, params: Record<string, unknown> = {}) {
  const session = driver.session();

  try {
    const res = await session.executeRead(tx => tx.run(query, params));
    return res.records.map(record => record.toObject());
  }
  finally {
    await session.close();
  }
}

export async function writeQuery(query: string, params = {}) {
  const session = driver.session()

  try {
    const res = await session.executeWrite(tx => tx.run(query, params));
    return res.records.map(record => record.toObject());
  }
  finally {
    await session.close();
  }
}
