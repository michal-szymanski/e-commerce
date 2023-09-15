import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { cn, getTotalPrice } from '@/lib/utils';
import { useCart } from '@/hooks/queries';

const CartFooter = () => {
    const { data: cart } = useCart();
    const totalPrice = cart?.reduce((acc, curr) => acc + z.coerce.number().parse(getTotalPrice(curr.product, curr.quantity)), 0).toFixed(2);

    return (
        <footer
            className={cn('fixed bottom-0 flex h-28 w-full translate-y-full items-center justify-end gap-5 bg-white p-10 shadow-2xl transition-transform', {
                'translate-y-0': cart?.length
            })}
        >
            <span className="text-2xl font-bold">{totalPrice} zł</span>
            <Button className="w-40">Buy</Button>
        </footer>
    );
};

export default CartFooter;
