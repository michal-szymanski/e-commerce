import { cartItemSchema } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { getProductPageUrl, getTotalPrice } from '@/lib/utils';
import QuantityCounter from '@/components/ui/custom/quantity-counter';
import { useUpdateCart } from '@/hooks/mutations';
import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';

type Props = {
    cartItem: z.infer<typeof cartItemSchema>;
};

const CartItem = ({ cartItem: { product, quantity } }: Props) => {
    const updateCart = useUpdateCart();

    const handleMinus = () => {
        if (quantity === 1) return;

        updateCart.mutate([{ product, quantity: quantity - 1 }]);
    };

    const handlePlus = () => {
        updateCart.mutate([{ product, quantity: quantity + 1 }]);
    };

    const handleBlur = (value: number) => {
        updateCart.mutate([{ product, quantity: value }]);
    };

    const handleRemove = () => {
        updateCart.mutate([{ product, quantity: 0 }]);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Button variant="link" className="p-0 text-2xl" asChild>
                        <Link href={getProductPageUrl(product.id, product.name)}>{product.name}</Link>
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="md:grid-cols-cart-item-md grid-cols-cart-item grid grid-flow-col place-items-center gap-5 text-sm md:gap-0">
                <span className="md:row-span-2">
                    <Image src={product.images[0]} alt={product.name} width={100} height={100} />
                </span>
                <span className="row-start-2 hidden md:block">{getTotalPrice(product.unitAmount, 1)}</span>
                <span className="row-start-2 hidden md:block">
                    <XMarkIcon className="h-4 w-4" />
                </span>
                <span className="row-start-2 md:col-span-1 md:justify-self-auto">
                    <QuantityCounter
                        initialQuantity={quantity}
                        handlePlus={handlePlus}
                        handleMinus={handleMinus}
                        handleBlur={handleBlur}
                        allowDecimal={false}
                    />
                </span>
                <span className="col-start-2 row-start-2 whitespace-nowrap font-bold md:col-start-5">
                    {getTotalPrice(product.unitAmount, quantity)} {product.currency.toUpperCase()}
                </span>
                <span className="col-start-2 md:col-start-5">
                    <Button variant="ghost" className="text-red-500 hover:bg-red-500 hover:text-white" onClick={handleRemove}>
                        Remove
                    </Button>
                </span>
            </CardContent>
        </Card>
    );
};

export default CartItem;
