import { env } from '@/env.mjs';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import SignInForm from '@/components/ui/custom/forms/auth/sign-in-form';
import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';

const Page = () => {
    return (
        <>
            <Head>
                <title>{`Sign In | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex flex-col items-center">
                <div className="w-full max-w-[400px]">
                    <SignInForm />
                </div>
            </div>
        </>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <DefaultLayout>{page}</DefaultLayout>;
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
