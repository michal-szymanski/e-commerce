import { Button } from '@/components/ui/button';
import { cn, getTotalPrice } from '@/lib/utils';
import { useCart } from '@/hooks/queries';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useOrganization, useUser } from '@clerk/nextjs';
import { StripePrice } from '@/types';

const CartFooter = () => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart(!!isSignedIn && !organization);
    const totalPrice = cart?.reduce((acc, curr) => acc + getTotalPrice((curr.product.default_price as StripePrice).unit_amount, curr.quantity), 0).toFixed(2);
    const router = useRouter();
    const isDialogOpen = useSelector((state: RootState) => state.ui.isDialogOpen);

    const renderButton = () => {
        if (router.asPath === '/cart') {
            return (
                <form action="/api/checkout-session" method="POST">
                    <Button className="w-40" type="submit">
                        Checkout
                    </Button>
                </form>
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
                'translate-y-0': cart?.length && !isDialogOpen && !organization
            })}
        >
            <span className="text-2xl font-bold">{totalPrice} zł</span>
            {renderButton()}
        </footer>
    );
};

export default CartFooter;
