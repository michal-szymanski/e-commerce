import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    server: {
        CONNECTION_STRING: z.string().url(),
        CLERK_SECRET_KEY: z.string(),
        STRIPE_SECRET_KEY: z.string()
    },
    client: {
        NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
        NEXT_PUBLIC_SUPABASE_KEY: z.string(),
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().startsWith('/'),
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().startsWith('/'),
        NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().startsWith('/'),
        NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().startsWith('/'),
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
        NEXT_PUBLIC_APP_NAME: z.string()
    },
    runtimeEnv: {
        CONNECTION_STRING: process.env.CONNECTION_STRING,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY,
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
        NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
        NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME
    }
});
