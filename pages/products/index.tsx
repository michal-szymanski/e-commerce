import Sidebar from '@/components/layouts/sidebar';
import Pagination from '@/components/ui/custom/pagination';
import ProductTile from '@/components/ui/custom/product-tile';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { getProducts } from '@/sql-service';
import { ProductWithMedia } from '@/types';
import Link from 'next/link';
import { getProductUrl } from '@/lib/utils';

export default ({ products }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const renderProducts = () => {
        if (!products?.length) {
            return <div>No items</div>;
        }

        return products.map((product) => (
            <Link key={product.id} href={getProductUrl(product.id, product.name)}>
                <ProductTile product={product} />
            </Link>
        ));
    };

    return (
        <>
            <div className="grid grid-cols-sidebar grid-rows-1">
                <Sidebar />
                <div className="border-l pr-20">
                    <div className="mb-5 flex justify-end pr-5">
                        <Pagination />
                    </div>
                    <div className="grid place-items-end gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">{renderProducts()}</div>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{ products: ProductWithMedia[] }> = async (context) => {
    const parsedSearch = z.string().safeParse(context.query.search);
    const parsedLimit = z.coerce.number().min(0).max(100).safeParse(context.query.limit);
    const parsedOffset = z.coerce.number().min(0).safeParse(context.query.offset);

    const search = parsedSearch.success ? parsedSearch.data : '';
    const limit = parsedLimit.success ? parsedLimit.data : 10;
    const offset = parsedOffset.success ? parsedOffset.data : 0;

    const products = await getProducts(search, limit, offset);

    return {
        props: {
            products
        }
    };
};
