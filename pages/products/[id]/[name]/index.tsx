import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { z } from 'zod';
import { productSchema, stripeProductSchema } from '@/types';
import stripe from '@/lib/stripe';
import { env } from '@/env.mjs';
import Head from 'next/head';
import ProductPage from '@/components/ui/custom/product-page';
import { useUpdateCart } from '@/hooks/mutations';
import { imagesTable, pricesTable, productsTable } from '@/schema';
import { and, asc, eq } from 'drizzle-orm';
import db from '@/lib/drizzle';
import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';
import { getProductPageParams } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';

const Page = ({ product }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const { isSignedIn } = useUser();
    const updateCart = useUpdateCart(!!isSignedIn);

    return (
        <>
            <Head>
                <title>{`${product.name} | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container">
                <ProductPage
                    isPreview={false}
                    id={product.id}
                    name={product.name}
                    price={product.unitAmount}
                    currency={product.currency}
                    images={product.images}
                    onAddToCart={(quantity: number) => updateCart.mutate([{ product, quantity }])}
                />
            </div>
        </>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export const getStaticPaths = (async () => {
    const paths = (await db.select({ id: productsTable.id, name: productsTable.name }).from(productsTable).where(eq(productsTable.active, true))).map(
        ({ id, name }) => ({ params: getProductPageParams(id, name) })
    );

    return {
        paths,
        fallback: false
    };
}) satisfies GetStaticPaths;

export const getStaticProps: GetStaticProps<{ product: z.infer<typeof productSchema> }> = async ({ params }) => {
    try {
        const parsedId = z.string().parse(params?.id);

        let product = (
            await db
                .select({
                    id: productsTable.id,
                    name: productsTable.name,
                    description: productsTable.description,
                    unitAmount: pricesTable.unitAmount,
                    currency: pricesTable.currency,
                    organizationId: productsTable.organizationId,
                    priceId: productsTable.priceId
                })
                .from(productsTable)
                .innerJoin(pricesTable, eq(productsTable.priceId, pricesTable.id))
                .where(and(eq(productsTable.id, parsedId), eq(productsTable.active, true)))
        )[0];

        let media = [];

        if (product) {
            media = await db.select({ src: imagesTable.src }).from(imagesTable).where(eq(imagesTable.productId, product.id)).orderBy(asc(imagesTable.sequence));

            return {
                props: {
                    product: { ...product, images: media.map((m) => m.src) }
                }
            };
        }

        const {
            id,
            name,
            description,
            images,
            active,
            default_price: { unit_amount: unitAmount, currency, id: priceId },
            metadata: { organizationId }
        } = stripeProductSchema.parse(
            await stripe.products.retrieve(parsedId, {
                expand: ['default_price']
            })
        );

        if (!active) {
            return {
                notFound: true
            };
        }

        return {
            props: {
                product: { id, name, description, unitAmount, currency, images, organizationId, priceId }
            }
        };
    } catch (e) {
        console.error(e);

        return {
            notFound: true
        };
    }
};

export default Page;
