import Image from 'next/image';
import { getProductPageUrl, getTotalPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCartIcon } from '@heroicons/react/20/solid';
import { useUpdateCart } from '@/hooks/mutations';
import PersonalAccount from '@/components/utils/personal-account';
import { useCart } from '@/hooks/queries';
import { useOrganization, useUser } from '@clerk/nextjs';
import AddToCartDialog from '@/components/ui/custom/add-to-cart-dialog';
import { setIsDialogOpen } from '@/store/slices/ui';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Rating from '@/components/ui/custom/rating';

type Props = {
    product: {
        id: string;
        name: string;
        description: string | null;
        unitAmount: number;
        currency: string;
        organizationId: string;
        priceId: string;
        images: string[];
    };
};

const ProductTile = ({ product }: Props) => {
    const router = useRouter();
    const updateCart = useUpdateCart();
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart(!!isSignedIn && !organization);
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    const handleOpenDialog = (isDialogOpen: boolean) => {
        dispatch(setIsDialogOpen({ isDialogOpen }));
        setOpen(isDialogOpen);
    };

    const handleTileClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        router.push(getProductPageUrl(product.id, product.name));
    };

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        const currentQuantity = cart?.find((c) => c.product.id === product.id)?.quantity ?? 0;
        updateCart.mutate([{ product, quantity: currentQuantity + 1 }]);
        handleOpenDialog(true);
    };

    return (
        <>
            <Card
                className="flex cursor-pointer flex-col justify-between transition-shadow hover:shadow-product-tile md:flex-row"
                onClick={handleTileClick}
                role="button"
                tabIndex={0}
            >
                <CardHeader className="flex flex-row gap-5">
                    <Image src={product.images[0]} alt={product.name} width={150} height={150} />
                    <div className="flex flex-col gap-3">
                        <CardTitle>{product.name}</CardTitle>
                        <Rating value={3} count={99} />
                    </div>
                </CardHeader>
                <CardFooter className="flex flex-col items-end justify-end">
                    <span className="size py-3 text-xl font-bold">
                        {getTotalPrice(product.unitAmount, 1)} {product.currency.toUpperCase()}
                    </span>
                    <PersonalAccount>
                        <Button type="button" className="flex w-full gap-5 md:w-40" onClick={handleAddToCart}>
                            <ShoppingCartIcon className="h-5 w-5" />
                            <span>Add to cart</span>
                        </Button>
                    </PersonalAccount>
                </CardFooter>
            </Card>
            <AddToCartDialog open={open} setOpen={handleOpenDialog} name={product.name} price={product.unitAmount} quantity={1} />
        </>
    );
};

export default ProductTile;
