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
import { getTotalPrice } from '@/lib/utils';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    name: string;
    quantity: number;
    price: number;
};

const AddToCartDialog = ({ open, setOpen, name, quantity, price }: Props) => {
    const router = useRouter();

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Added to cart</AlertDialogTitle>
                    <AlertDialogDescription>
                        {name} {quantity} x {price} = {getTotalPrice(price, quantity)}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Continue shopping</AlertDialogCancel>
                    <AlertDialogAction onClick={() => router.push('/cart')}>Go to cart</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AddToCartDialog;
