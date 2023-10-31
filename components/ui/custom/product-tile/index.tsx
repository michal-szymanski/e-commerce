import Image from 'next/image';
import Rating from '@/components/ui/custom/rating';
import { getProductPageUrl, getTotalPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCartIcon } from '@heroicons/react/20/solid';

type Props = {
    product: { id: string; name: string; unitAmount: number; currency: string; images: string[] };
};

const ProductTile = ({ product }: Props) => {
    const router = useRouter();
    const handleTileClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        router.push(getProductPageUrl(product.id, product.name));
    };

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        console.log(e);
    };

    return (
        <Card
            className="flex min-w-[25rem] cursor-pointer flex-col justify-between transition-shadow hover:shadow-product-tile lg:flex-row"
            onClick={handleTileClick}
        >
            <CardHeader className="flex flex-row gap-5">
                <Image src={product.images[0]} alt={product.name} width={150} height={150} />
                <div className="flex flex-col gap-3">
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>
                        <Rating value={3} count={99} />
                    </CardDescription>
                </div>
            </CardHeader>
            <CardFooter className="flex flex-col items-end justify-end">
                <span className="size py-3 text-xl font-bold">
                    {getTotalPrice(product.unitAmount, 1)} {product.currency.toUpperCase()}
                </span>
                <Button type="button" className="flex w-full gap-5 lg:w-40" onClick={handleAddToCart}>
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>Add to cart</span>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProductTile;
