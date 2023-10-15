import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { productSchema, stripeProductSchema } from '@/types';
import stripe from '@/lib/stripe';
import { env } from '@/env.mjs';
import Head from 'next/head';
import ProductPage from '@/components/ui/custom/product-page';
import { useUpdateCart } from '@/hooks/mutations';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { imagesTable, pricesTable, productsTable } from '@/schema';
import { and, asc, eq } from 'drizzle-orm';

const Page = ({ product }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const updateCart = useUpdateCart();

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

export const getServerSideProps: GetServerSideProps<{ product: z.infer<typeof productSchema> }> = async (context) => {
    try {
        const parsedId = z.string().parse(context.query.id);
        const client = postgres(env.CONNECTION_STRING);
        const db = drizzle(client);
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

            await client.end();

            return {
                props: {
                    product: { ...product, images: media.map((m) => m.src) }
                }
            };
        }

        await client.end();

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
