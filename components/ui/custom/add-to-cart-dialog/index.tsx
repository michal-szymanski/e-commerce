import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/router';
import { debounce, getTotalPrice } from '@/lib/utils';
import { useCallback } from 'react';
import { CartItem, StripePrice } from '@/types';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    cartItem: CartItem;
};

const AddToCartDialog = ({ open, setOpen, cartItem: { product, quantity } }: Props) => {
    const router = useRouter();
    const handleGoToCart = useCallback(
        () => debounce(() => router.push('/cart'), 200),
        [router]
    );

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Added to cart</AlertDialogTitle>
                    <AlertDialogDescription>
                        {product.name} {quantity} x {(product.default_price as StripePrice).unit_amount} = {getTotalPrice(product, quantity)}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Continue shopping</AlertDialogCancel>
                    <AlertDialogAction onClick={handleGoToCart}>Go to cart</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AddToCartDialog;
