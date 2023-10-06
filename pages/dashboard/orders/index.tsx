import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';

const Page = () => {
    return <div><h1 className="font-bold text-4xl pb-10">Orders</h1></div>;
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
