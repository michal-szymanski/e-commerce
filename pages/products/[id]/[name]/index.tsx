import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { StripePrice, StripeProduct, stripeProductSchema } from '@/types';
import stripe from '@/lib/stripe';
import { env } from '@/env.mjs';
import Head from 'next/head';
import ProductPage from '@/components/ui/custom/product-page';
import { useUpdateCart } from '@/hooks/mutations';

const Page = ({ product }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const updateCart = useUpdateCart();
    const { unit_amount, currency } = product.default_price as StripePrice;

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
                    price={unit_amount}
                    currency={currency}
                    images={product.images}
                    onAddToCart={(quantity: number) => updateCart.mutate([{ product, quantity }])}
                />
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{ product: StripeProduct }> = async (context) => {
    try {
        const parsedId = z.string().parse(context.query.id);
        const response = await stripe.products.retrieve(parsedId, {
            expand: ['default_price']
        });
        const product = stripeProductSchema.parse(response);

        return {
            props: {
                product
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
