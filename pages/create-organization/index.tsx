import CreateOrganizationForm from '@/components/ui/custom/forms/create-organization-form';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';

const Page = () => (
    <>
        <Head>
            <title>{`Create Organization | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
        </Head>
        <div className="container flex flex-col items-center">
            <div className="w-full max-w-[400px]">
                <CreateOrganizationForm />
            </div>
        </div>
    </>
);

Page.getLayout = (page: ReactNode) => {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
    const { orgId } = getAuth(context.req);

    if (orgId) {
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
