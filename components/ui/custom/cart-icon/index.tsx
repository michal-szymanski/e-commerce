import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/queries';
import { useOrganization, useUser } from '@clerk/nextjs';

const CartCounter = () => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart({ enabled: !organization, isSignedIn: !!isSignedIn });

    const numberOfProducts = cart?.reduce((acc, curr) => acc + Number(curr.quantity), 0);

    return (
        <div className="relative">
            <ShoppingCartIcon className="h-7 w-7" />
            <div
                className={cn(
                    'absolute right-[-5px] top-[-5px] flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-xs font-semibold text-white opacity-0',
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
