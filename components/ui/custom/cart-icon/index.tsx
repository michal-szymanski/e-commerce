import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/queries';
import { useOrganization, useUser } from '@clerk/nextjs';

const CartCounter = () => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart(!!isSignedIn && !organization);

    const numberOfProducts = cart?.reduce((acc, curr) => acc + Number(curr.quantity), 0);

    return (
        <div className="relative">
            <ShoppingCartIcon className="h-6 w-6 md:h-7 md:w-7" />
            <div
                className={cn(
                    'absolute right-[-7px] top-[-7px] flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-xs font-semibold text-white opacity-0 md:right-[-5px] md:top-[-5px]',
                    {
                        'opacity-100': numberOfProducts
                    }
                )}
            >
                {numberOfProducts}
            </div>
        </div>
    );
};

export default CartCounter;
