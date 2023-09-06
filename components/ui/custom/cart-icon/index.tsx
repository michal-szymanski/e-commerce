import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const CartCounter = () => {
    const cart = useSelector((state: RootState) => state.order.cart);
    const numberOfProducts = cart.reduce((acc, curr) => acc + curr.quantity, 0);

    return (
        <div className="relative">
            <ShoppingCartIcon className="h-7 w-7" />
            <div
                className={cn(
                    'absolute right-[-5px] top-[-5px] flex h-4 w-4 items-center justify-center rounded-full bg-red-400 text-xs font-semibold text-white opacity-0',
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
