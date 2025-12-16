// Backend\src\db\db.ts


import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is missing');

export const db = new Pool({ connectionString });

// Small helper for transactions
export async function withTx<T>(fn: (client: import('pg').PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const res = await fn(client);
    await client.query('COMMIT');
    return res;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
