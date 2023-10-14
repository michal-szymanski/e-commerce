import { useCart } from '@/hooks/queries';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { useOrganization, useUser } from '@clerk/nextjs';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { orderSchema } from '@/types';
import { getAuth } from '@clerk/nextjs/server';
import { organizations as organizationsAPI } from '@clerk/nextjs/api';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getCartItems, getCartOrders } from '@/sql-service';
import { z } from 'zod';
import { dehydrate, DehydratedState, QueryClient } from '@tanstack/react-query';
import CartItem from '@/components/ui/custom/cart-item';

const Page = ({ organizations }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart(!!isSignedIn && !organization);

    return (
        <>
            <Head>
                <title>{`Cart | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="flex flex-col items-center gap-5 pb-36">
                {organizations.map((o) => {
                    const organizationCartItems = cart?.filter((cartItem) => cartItem.product.organizationId === o.id);
                    if (!organizationCartItems?.length) return null;
                    return (
                        <div key={o.id}>
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

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);
    const orders = await getCartOrders(db, userId);
    const parsedOrders = z.array(orderSchema).length(1).safeParse(orders);
    const cartItems = parsedOrders.success ? await getCartItems(db, parsedOrders.data[0].id) : [];
    await client.end();

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
