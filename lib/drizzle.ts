import { Pool } from 'pg';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
    connectionString: env.CONNECTION_STRING
});

const db = drizzle(pool);

export default db;
