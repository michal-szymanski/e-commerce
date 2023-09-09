import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import CartItem from '@/components/ui/custom/cart-item';

export default () => {
    const cart = useSelector((state: RootState) => state.order.cart);

    return (
        <div className="flex flex-col items-center gap-5">
            {cart.map(({ quantity, product }) => (
                <CartItem key={product.id} quantity={quantity} product={product} />
            ))}
        </div>
    );
};
