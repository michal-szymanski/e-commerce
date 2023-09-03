import type { Config } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export default {
    schema: './schema.ts',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.CONNECTION_STRING!
    },
    verbose: true
} satisfies Config;
