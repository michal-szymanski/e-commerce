import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Image from 'next/image';
import { z } from 'zod';
import { getProduct } from '@/sql-service';
import { ProductWithMedia } from '@/types';
import { Button } from '@/components/ui/button';
import QuantityCounter from '@/components/ui/custom/quantity-counter';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateCart } from '@/hooks/mutations';
import { useCart } from '@/hooks/queries';
import AddToCartDialog from '@/components/ui/custom/add-to-cart-dialog';
import { useDispatch } from 'react-redux';
import { setIsDialogOpen } from '@/store/slices/ui';

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

    return (
        <>
            <div className="container">
                <article>
                    <header>
                        <h2 className="text-2xl font-bold">{product.name}</h2>
                    </header>
                    <div className="flex gap-10 py-10">
                        <Image src={product.src} alt={product.name} width={500} height={500} />
                        <Card className="w-[400px]">
                            <CardHeader>
                                <CardTitle className="font-bold">{product.price}</CardTitle>
                                <CardDescription>+ VAT</CardDescription>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>
                    </div>
                </article>
            </div>
            <AddToCartDialog open={open} setOpen={handleOpenDialog} cartItem={{ product, quantity }} />
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{ product: ProductWithMedia }> = async (context) => {
    try {
        const parsedId = z.coerce.number().parse(context.query.id);
        const product = await getProduct(parsedId);

        return {
            props: {
                product
            }
        };
    } catch {
        return {
            notFound: true
        };
    }
};
