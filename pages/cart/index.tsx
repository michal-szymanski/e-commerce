import CartItem from '@/components/ui/custom/cart-item';
import { useCart } from '@/hooks/queries';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { useOrganization, useUser } from '@clerk/nextjs';
import { GetServerSideProps } from 'next';
import { orderSchema } from '@/types';
import { getAuth } from '@clerk/nextjs/server';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getCartItems, getCartOrders } from '@/sql-service';
import { z } from 'zod';
import { dehydrate, QueryClient } from '@tanstack/react-query';

const Page = () => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart(!!isSignedIn && !organization);

    return (
        <>
            <Head>
                <title>{`Cart | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="flex flex-col items-center gap-5 pb-36">{cart?.map((cartItem) => <CartItem key={cartItem.product.id} cartItem={cartItem} />)}</div>
        </>
    );
};

export default Page;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { orgId, userId } = getAuth(context.req);

    if (orgId || !userId) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(['order'], async () => {
        const client = postgres(env.CONNECTION_STRING);
        const db = drizzle(client);
        const orders = await getCartOrders(db, userId);
        const parsedOrders = z.array(orderSchema).length(1).safeParse(orders);
        const cartItems = parsedOrders.success ? await getCartItems(db, parsedOrders.data[0].id) : [];
        await client.end();
        return cartItems;
    });

    return {
        props: {
            dehydratedState: dehydrate(queryClient)
        }
    };
};
