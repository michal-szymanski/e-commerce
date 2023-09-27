import { SignUp } from '@clerk/nextjs';
import { env } from '@/env.mjs';
import Head from 'next/head';

export default () => (
    <>
        <Head>
            <title>{`Sign Up | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
        </Head>
        <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            appearance={{
                elements: {
                    rootBox: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                }
            }}
        />
    </>
);
