import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { cn, getTotalPrice } from '@/lib/utils';
import { useCart } from '@/hooks/queries';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCreateOrder } from '@/hooks/mutations';

const CartFooter = () => {
    const { data: cart } = useCart();
    const totalPrice = cart?.reduce((acc, curr) => acc + z.coerce.number().parse(getTotalPrice(curr.product, curr.quantity)), 0).toFixed(2);
    const router = useRouter();
    const isDialogOpen = useSelector((state: RootState) => state.ui.isDialogOpen);
    const createOrder = useCreateOrder();

    const renderButton = () => {
        if (router.asPath === '/cart') {
            return (
                <Button
                    className="w-40"
                    onClick={async () => {
                        const { orderId } = await createOrder.mutateAsync();
                        await router.push(`/orders/${orderId}`);
                    }}
                >
                    Buy
                </Button>
            );
        }

        return (
            <Button className="w-40" onClick={() => router.push('/cart')}>
                Go to cart
            </Button>
        );
    };

    return (
        <footer
            className={cn('fixed bottom-0 flex h-28 w-full translate-y-full items-center justify-end gap-5 bg-white p-10 shadow-2xl transition-transform', {
                'translate-y-0': cart?.length && !isDialogOpen
            })}
        >
            <span className="text-2xl font-bold">{totalPrice} zł</span>
            {renderButton()}
        </footer>
    );
};

export default CartFooter;
