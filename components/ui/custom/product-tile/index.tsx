import { Product, Media } from '@/types';
import Image from 'next/image';
import Rating from '@/components/ui/custom/rating';
import { getRandomValue } from '@/lib/utils';

type Props = {
    product: Product & Pick<Media, 'src' | 'mimeType'>;
};

const ProductTile = ({ product }: Props) => (
    <div className="hover:shadow-product-tile flex cursor-pointer flex-col rounded-md bg-white p-5 transition-shadow">
        <Image src={product.src} alt={product.name} width={200} height={200} />
        <div className="mt-3 flex flex-col gap-2 px-2">
            <h3 className="font-semibold">{product.name}</h3>
            <Rating value={getRandomValue(1, 5)} count={getRandomValue(1, 100)} />
            <span className="size text-xl font-bold">{product.price} PLN</span>
        </div>
    </div>
);

export default ProductTile;
