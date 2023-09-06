import { Product, Media } from '@/types';
import Image from 'next/image';
import Rating from '@/components/ui/custom/rating';
import { getRandomValue } from '@/lib/utils';
import { addToCart } from '@/store/slices/order';
import { useDispatch } from 'react-redux';

type Props = {
    product: Product & Pick<Media, 'src' | 'mimeType'>;
};

const ProductTile = ({ product }: Props) => {
    const dispatch = useDispatch();

    return (
        <article
            className="hover:shadow-product-tile flex cursor-pointer flex-col rounded-md bg-white p-5 transition-shadow"
            onClick={() => dispatch(addToCart(product))}
            role="button"
            tabIndex={0}
        >
            <Image src={product.src} alt={product.name} width={200} height={200} />
            <header className="mt-3 flex flex-col gap-2 px-2">
                <h3 className="font-semibold">{product.name}</h3>
                <Rating value={getRandomValue(1, 5)} count={getRandomValue(1, 100)} />
                <span className="size text-xl font-bold">{product.price} PLN</span>
            </header>
        </article>
    );
};

export default ProductTile;
