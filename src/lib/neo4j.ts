import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
);

export const session = driver.session();

export async function closeSession() {
  await session.close();
  await driver.close();
}

process.on('SIGINT', async () => {
  await closeSession();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeSession();
});
