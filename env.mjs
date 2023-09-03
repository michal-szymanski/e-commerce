import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    server: {
        CONNECTION_STRING: z.string().url()
    },
    runtimeEnv: {
        CONNECTION_STRING: process.env.CONNECTION_STRING
    }
});
