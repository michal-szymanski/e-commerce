import { StripePrice, StripeProduct } from '@/types';
import Image from 'next/image';
import Rating from '@/components/ui/custom/rating';
import { getTotalPrice } from '@/lib/utils';

type Props = {
    product: StripeProduct;
};

const ProductTile = ({ product }: Props) => {
    const { unit_amount, currency } = product.default_price as StripePrice;
    return (
        <article className="flex cursor-pointer flex-col rounded-md bg-white p-5 transition-shadow hover:shadow-product-tile">
            <Image src={product.images[0]} alt={product.name} width={200} height={200} />
            <header className="mt-3 flex flex-col gap-2 px-2">
                <h3 className="font-semibold">{product.name}</h3>
                <Rating value={3} count={99} />
                <span className="size text-xl font-bold">
                    {getTotalPrice(unit_amount, 1)} {currency.toUpperCase()}
                </span>
            </header>
        </article>
    );
};

export default ProductTile;
