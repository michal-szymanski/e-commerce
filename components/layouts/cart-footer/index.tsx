import { Button } from '@/components/ui/button';
import { getTotalPrice } from '@/lib/utils';
import { useCart } from '@/hooks/queries';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useCreateCheckoutSession } from '@/hooks/mutations';
import { cn } from '@/lib/tailwind';

const CartFooter = () => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart({ enabled: !organization, isSignedIn: !!isSignedIn });
    const totalPrice = cart?.reduce((acc, curr) => acc + Number(getTotalPrice(curr.product.unitAmount, curr.quantity)), 0).toFixed(2);
    const router = useRouter();
    const isDialogOpen = useSelector((state: RootState) => state.ui.isDialogOpen);
    const createCheckoutSession = useCreateCheckoutSession();

    const renderButton = () => {
        if (router.asPath === '/cart') {
            return (
                <Button
                    type="button"
                    className="w-40"
                    onClick={() => {
                        if (!cart?.length) return;
                        createCheckoutSession.mutate(cart, { onSuccess: ({ sessionUrl }) => router.push(sessionUrl) });
                    }}
                >
                    Checkout
                </Button>
            );
        }

        return (
            <Button type="button" className="w-40" onClick={() => router.push('/cart')}>
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
            <span className="whitespace-nowrap text-2xl font-bold">
                {totalPrice} {cart?.[0]?.product.currency.toUpperCase()}
            </span>
            {renderButton()}
        </footer>
    );
};

export default CartFooter;
