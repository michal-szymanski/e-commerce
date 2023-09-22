import { StripePrice, StripeProduct } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { getProductUrl, getTotalPrice } from '@/lib/utils';
import QuantityCounter from '@/components/ui/custom/quantity-counter';
import { useUpdateCart } from '@/hooks/mutations';
import Link from 'next/link';

type Props = {
    product: StripeProduct;
    quantity: number;
};

const CartItem = ({ product, quantity }: Props) => {
    const updateCart = useUpdateCart();

    const handleMinus = async () => {
        if (quantity === 1) return;

        await updateCart.mutate([{ product, quantity: quantity - 1 }]);
    };

    const handlePlus = async () => {
        await updateCart.mutate([{ product, quantity: quantity + 1 }]);
    };

    const handleBlur = async (value: number) => {
        await updateCart.mutate([{ product, quantity: value }]);
    };

    const handleRemove = async () => {
        await updateCart.mutate([{ product, quantity: 0 }]);
    };

    const { unit_amount, currency } = product.default_price as StripePrice;

    return (
        <Card className="w-[700px]">
            <CardHeader>
                <CardTitle>
                    <Link href={getProductUrl(product.id, product.name)}>
                        <Button variant="link" className="p-0 text-2xl">
                            {product.name}
                        </Button>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
                <Image src={product.images[0]} alt={product.name} width={50} height={50} />
                <div className="flex h-full w-full items-center justify-between px-5">
                    <span>{unit_amount}</span>
                    <span>
                        <XMarkIcon className="h-4 w-4" />
                    </span>
                    <QuantityCounter initialQuantity={quantity} handlePlus={handlePlus} handleMinus={handleMinus} handleBlur={handleBlur} />
                    <span className="font-bold">
                        {getTotalPrice(product, quantity)} {currency.toUpperCase()}
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
