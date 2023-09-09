import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import CartItem from '@/components/ui/custom/cart-item';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { getTotalPrice } from '@/lib/utils';

export default () => {
    const cart = useSelector((state: RootState) => state.order.cart);
    const totalPrice = cart.reduce((acc, curr) => acc + z.coerce.number().parse(getTotalPrice(curr.product, curr.quantity)), 0).toFixed(2);

    return (
        <>
            <div className="flex flex-col items-center gap-5">
                {cart.map(({ quantity, product }) => (
                    <CartItem key={product.id} initialQuantity={quantity} product={product} />
                ))}
            </div>
            {cart.length > 0 && (
                <footer className="fixed bottom-0 flex h-28 w-full items-center justify-end gap-5 p-10 shadow-2xl">
                    <span className="text-2xl font-bold">{totalPrice} zł</span>
                    <Button className="w-40">Buy</Button>
                </footer>
            )}
        </>
    );
};
