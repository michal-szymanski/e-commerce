import { cartItemSchema } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { getProductUrl, getTotalPrice } from '@/lib/utils';
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
        <Card className="w-[700px]">
            <CardHeader>
                <CardTitle>
                    <Button variant="link" className="p-0 text-2xl" asChild>
                        <Link href={getProductUrl(product.id, product.name)}>{product.name}</Link>
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
                <Image src={product.images[0]} alt={product.name} width={50} height={50} />
                <div className="flex h-full w-full items-center justify-between px-5">
                    <span>{getTotalPrice(product.unitAmount, 1)}</span>
                    <span>
                        <XMarkIcon className="h-4 w-4" />
                    </span>
                    <QuantityCounter
                        initialQuantity={quantity}
                        handlePlus={handlePlus}
                        handleMinus={handleMinus}
                        handleBlur={handleBlur}
                        allowDecimal={false}
                    />
                    <span className="font-bold">
                        {getTotalPrice(product.unitAmount, quantity)} {product.currency.toUpperCase()}
                    </span>
                    <Button variant="ghost" className="text-red-500 hover:bg-red-500 hover:text-white" onClick={handleRemove}>
                        Remove
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default CartItem;
