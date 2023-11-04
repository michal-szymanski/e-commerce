import { useCart } from '@/hooks/queries';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { useOrganization, useUser } from '@clerk/nextjs';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { organizations as organizationsAPI } from '@clerk/nextjs/api';
import { getCartItems } from '@/sql-service';
import { dehydrate, DehydratedState, QueryClient } from '@tanstack/react-query';
import CartItem from '@/components/ui/custom/cart-item';
import db from '@/lib/drizzle';
import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';

const Page = ({ organizations }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart(!!isSignedIn && !organization);

    return (
        <>
            <Head>
                <title>{`Cart | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex flex-col items-center gap-5 pb-36">
                {organizations.map((o) => {
                    const organizationCartItems = cart?.filter((cartItem) => cartItem.product.organizationId === o.id);
                    if (!organizationCartItems?.length) return null;
                    return (
                        <div key={o.id} className="w-full">
                            <h2 className="py-5 text-3xl font-bold">{o.name}</h2>
                            <div className="flex flex-col gap-3">
                                {organizationCartItems.map((cartItem) => (
                                    <CartItem key={cartItem.product.id} cartItem={cartItem} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export default Page;

export const getServerSideProps: GetServerSideProps<{ dehydratedState: DehydratedState; organizations: { id: string; name: string }[] }> = async (context) => {
    const { orgId, userId } = getAuth(context.req);

    if (orgId || !userId) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    const cartItems = await getCartItems(db, userId);

    const organizationIds = [...new Set(cartItems.map((ci) => ci.product.organizationId))];

    const organizations: { id: string; name: string }[] = [];

    for (let id of organizationIds) {
        const { name } = await organizationsAPI.getOrganization({ organizationId: id });
        organizations.push({ id, name });
    }

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(['order'], async () => cartItems);

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
            organizations
        }
    };
};
