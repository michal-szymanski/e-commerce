import CreateOrganizationForm from '@/components/ui/custom/forms/create-organization-form';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';

const Page = () => (
    <>
        <Head>
            <title>{`Create Organization | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
        </Head>
        <div className="container flex h-1/5 w-[400px] flex-col items-center justify-end">
            <div className="w-[400px]">
                <CreateOrganizationForm />
            </div>
        </div>
    </>
);

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
