import { env } from '@/env.mjs';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import SignInForm from '@/components/ui/custom/forms/sign-in-form';

const Page = () => {
    return (
        <>
            <Head>
                <title>{`Sign In | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex h-1/5 w-[400px] flex-col items-center justify-end">
                <div className="w-[400px]">
                    <SignInForm />
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
    const { userId } = getAuth(context.req);

    if (userId) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    return {
        props: {}
    };
};

export default Page;
