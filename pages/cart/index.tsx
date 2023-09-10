import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import CartItem from '@/components/ui/custom/cart-item';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { getTotalPrice } from '@/lib/utils';
import { useCreateOrder } from '@/hooks/mutations';
import { clearCart } from '@/store/slices/order';
import { useRouter } from 'next/navigation';

export default () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const cart = useSelector((state: RootState) => state.order.cart);
    const totalPrice = cart.reduce((acc, curr) => acc + z.coerce.number().parse(getTotalPrice(curr.product, curr.quantity)), 0).toFixed(2);
    const createOrder = useCreateOrder(cart);

    return (
        <>
            <div className="flex flex-col items-center gap-5 pb-36">
                {cart.map(({ quantity, product }) => (
                    <CartItem key={product.id} initialQuantity={quantity} product={product} />
                ))}
            </div>
            {cart.length > 0 && (
                <footer className="fixed bottom-0 flex h-28 w-full items-center justify-end gap-5 bg-white p-10 shadow-2xl">
                    <span className="text-2xl font-bold">{totalPrice} zł</span>
                    <Button
                        className="w-40"
                        onClick={() =>
                            createOrder.mutate(undefined, {
                                onSuccess: async (response) => {
                                    dispatch(clearCart());

                                    const { order } = await response.json();
                                    router.push(`/orders/${order.id}`);
                                }
                            })
                        }
                    >
                        Buy
                    </Button>
                </footer>
            )}
        </>
    );
};
