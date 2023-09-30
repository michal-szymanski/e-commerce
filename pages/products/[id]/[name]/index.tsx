import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Image from 'next/image';
import { z } from 'zod';
import { StripePrice, StripeProduct, stripeProductSchema } from '@/types';
import { Button } from '@/components/ui/button';
import QuantityCounter from '@/components/ui/custom/quantity-counter';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateCart } from '@/hooks/mutations';
import { useCart } from '@/hooks/queries';
import AddToCartDialog from '@/components/ui/custom/add-to-cart-dialog';
import { useDispatch } from 'react-redux';
import { setIsDialogOpen } from '@/store/slices/ui';
import stripe from '@/stripe';
import { env } from '@/env.mjs';
import Head from 'next/head';
import PersonalAccount from '@/components/utils/personal-account';

export default ({ product }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const [quantity, setQuantity] = useState(1);
    const { data: cart } = useCart();
    const updateCart = useUpdateCart();
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    const cartItemQuantity = cart?.find((ol) => ol.product.id === product.id)?.quantity ?? 0;

    const handlePlus = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleMinus = () => {
        setQuantity((prev) => prev - 1);
    };

    const handleBlur = (value: number) => {
        setQuantity(value);
    };

    const handleOpenDialog = (isDialogOpen: boolean) => {
        dispatch(setIsDialogOpen({ isDialogOpen }));
        setOpen(isDialogOpen);
    };

    const { unit_amount, currency } = product.default_price as StripePrice;

    return (
        <>
            <Head>
                <title>{`${product.name} | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container">
                <article>
                    <header>
                        <h2 className="text-2xl font-bold">{product.name}</h2>
                    </header>
                    <div className="flex gap-10 py-10">
                        <Image src={product.images[0]} alt={product.name} width={500} height={500} />
                        <Card className="w-[400px]">
                            <CardHeader>
                                <CardTitle className="font-bold">
                                    {unit_amount / 100} {currency.toUpperCase()}
                                </CardTitle>
                                <CardDescription>+ VAT</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PersonalAccount>
                                    <div className="flex items-center gap-5 pb-5">
                                        <span className="text-lg font-semibold">Quantity:</span>
                                        <QuantityCounter initialQuantity={quantity} handlePlus={handlePlus} handleMinus={handleMinus} handleBlur={handleBlur} />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={async () => {
                                            handleOpenDialog(true);
                                            await updateCart.mutate([{ product, quantity: quantity + Number(cartItemQuantity) }]);
                                        }}
                                    >
                                        Add to cart
                                    </Button>
                                </PersonalAccount>
                            </CardContent>
                        </Card>
                    </div>
                </article>
            </div>
            <AddToCartDialog open={open} setOpen={handleOpenDialog} cartItem={{ product, quantity }} />
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
