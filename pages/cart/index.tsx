import { useCart, useCartOrganizations } from '@/hooks/queries';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { useOrganization, useUser } from '@clerk/nextjs';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { organizations as organizationsAPI } from '@clerk/nextjs/api';
import { getCartItems } from '@/services/sql-service';
import { dehydrate, DehydratedState, QueryClient } from '@tanstack/react-query';
import CartItem from '@/components/ui/custom/cart-item';
import db from '@/lib/drizzle';
import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';

const Page = () => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart({ enabled: !organization, isSignedIn: !!isSignedIn });
    const { data: organizations } = useCartOrganizations({ cart });

    return (
        <>
            <Head>
                <title>{`Cart | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex flex-col items-center gap-5 pb-36">
                {organizations?.map((o) => {
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

export const getServerSideProps: GetServerSideProps<{ dehydratedState?: DehydratedState }> = async (context) => {
    const { orgId, userId } = getAuth(context.req);

    if (orgId) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    if (!userId) {
        return {
            props: {}
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
    await queryClient.prefetchQuery(['cart-organizations'], async () => organizations);
    await queryClient.prefetchQuery(['order'], async () => cartItems);

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
            organizations
        }
    };
};
