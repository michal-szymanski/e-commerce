import { UserProfile } from '@clerk/nextjs';
import Head from 'next/head';
import { env } from '@/env.mjs';

export default () => (
    <>
        <Head>
            <title>{`User Profile | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
        </Head>
        <UserProfile
            path="/user-profile"
            routing="path"
            appearance={{
                elements: {
                    rootBox: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                }
            }}
        />
    </>
);
