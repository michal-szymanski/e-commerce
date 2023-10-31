import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { ReactNode } from 'react';
import DashboardLayout from '@/components/layouts/dashboard-layout';

const Page = () => {
    return (
        <div className="container relative mx-auto py-10">
            <h1 className="pb-10 text-4xl font-bold">Orders</h1>
        </div>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default Page;

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
    const { userId, orgId } = getAuth(context.req);

    if (!userId || !orgId) {
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
