import Sidebar from '@/components/layouts/sidebar';
import Pagination from '@/components/ui/custom/pagination';
import ProductTile from '@/components/ui/custom/product-tile';
import { GetServerSideProps } from 'next';
import { z } from 'zod';
import { dehydrate, DehydratedState, QueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/queries';
import { getProducts } from '@/sql-service';

export default () => {
    const searchParams = useSearchParams();
    const search = searchParams.get('search') ?? '';
    const limit = Number(searchParams.get('limit') ?? 10);
    const offset = Number(searchParams.get('offset') ?? 0);
    const { data: products } = useProducts(search, limit, offset);

    const renderProducts = () => {
        if (!products?.length) {
            return <div>No items</div>;
        }

        return products.map((product) => <ProductTile key={product.id} product={product} />);
    };

    return (
        <>
            <div className="grid grid-cols-sidebar grid-rows-1">
                <Sidebar />
                <main className="border-l pr-20">
                    <div className="mb-5 flex justify-end pr-5">
                        <Pagination />
                    </div>
                    <div className="grid place-items-end gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">{renderProducts()}</div>
                </main>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{ dehydratedState: DehydratedState }> = async (context) => {
    const parsedSearch = z.string().safeParse(context.query.search);
    const parsedLimit = z.coerce.number().min(0).max(100).safeParse(context.query.limit);
    const parsedOffset = z.coerce.number().min(0).safeParse(context.query.offset);

    const search = parsedSearch.success ? parsedSearch.data : '';
    const limit = parsedLimit.success ? parsedLimit.data : 10;
    const offset = parsedOffset.success ? parsedOffset.data : 0;

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(['products', { search }, { limit }, { offset }], () => getProducts(search, limit, offset, 'ssr'));

    return {
        props: {
            dehydratedState: dehydrate(queryClient)
        }
    };
};
