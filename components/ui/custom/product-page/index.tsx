import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PersonalAccount from '@/components/utils/personal-account';
import QuantityCounter from '@/components/ui/custom/quantity-counter';
import { Button } from '@/components/ui/button';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useCart } from '@/hooks/queries';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setIsDialogOpen } from '@/store/slices/ui';
import AddToCartDialog from '@/components/ui/custom/add-to-cart-dialog';
import BusinessAccount from '@/components/utils/business-account';
import { getTotalPrice } from '@/lib/utils';

type Props = {
    isPreview: boolean;
    id?: string;
    name: string;
    price: number;
    currency: string;
    images: string[];
    onAddToCart?: (quantity: number) => void;
};

const ProductPage = ({ isPreview, id, name, price, currency, images, onAddToCart }: Props) => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart({ enabled: !organization, isSignedIn: !!isSignedIn });

    const [quantity, setQuantity] = useState(1);
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    const cartItemQuantity = cart?.find((ol) => id && ol.product.id === id)?.quantity ?? 0;

    const handlePlus = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleMinus = () => {
        setQuantity((prev) => prev - 1);
    };

    const handleBlur = (value: number) => {
        setQuantity(value);
    };

    const handleOpenDialog = (isDialogOpen: boolean) => {
        dispatch(setIsDialogOpen({ isDialogOpen }));
        setOpen(isDialogOpen);
    };

    const renderQuantityCounter = () => (
        <div className="flex items-center gap-5 pb-5">
            <span className="text-lg font-semibold">Quantity:</span>
            <QuantityCounter initialQuantity={quantity} handlePlus={handlePlus} handleMinus={handleMinus} handleBlur={handleBlur} allowDecimal={false} />
        </div>
    );

    return (
        <article>
            <header className="min-h-[50px] w-[500px]">
                <h2 className="break-words text-2xl font-bold">{name}</h2>
            </header>
            <div className="flex gap-10 py-10">
                <div className="h-[500px] w-[500px]">{images.length > 0 && <Image src={images[0]} alt={name} width={500} height={500} />}</div>
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="font-bold">
                            {getTotalPrice(price, 1)} {currency.toUpperCase()}
                        </CardTitle>
                        <CardDescription>+ VAT</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PersonalAccount>
                            {renderQuantityCounter()}
                            <Button
                                className="w-full"
                                onClick={async () => {
                                    if (isPreview || !onAddToCart) return;
                                    handleOpenDialog(true);
                                    onAddToCart(quantity + Number(cartItemQuantity));
                                }}
                            >
                                Add to cart
                            </Button>
                        </PersonalAccount>
                        <BusinessAccount>
                            {isPreview && (
                                <>
                                    {renderQuantityCounter()}
                                    <Button className="w-full">Add to cart</Button>
                                </>
                            )}
                        </BusinessAccount>
                    </CardContent>
                </Card>
            </div>
            {!isPreview && <AddToCartDialog open={open} setOpen={handleOpenDialog} name={name} price={price} quantity={quantity} />}
        </article>
    );
};

export default ProductPage;
