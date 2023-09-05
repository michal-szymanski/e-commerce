import { Product, Media } from '@/types';
import Image from 'next/image';

type Props = {
    product: Product & Pick<Media, 'src' | 'mimeType'>;
};

const ProductTile = ({ product }: Props) => (
    <div key={product.id} className="flex flex-col items-center">
        <div>{product.name}</div>
        <Image src={product.src} alt={product.name} width={200} height={200} />
    </div>
);

export default ProductTile;
