import { useState } from 'react';
import { useProducts } from '@/hooks/queries';
import Sidebar from '@/components/layouts/sidebar';
import Pagination from '@/components/ui/custom/pagination';
import ProductTile from '@/components/ui/custom/product-tile';

export default () => {
    const [limit, setLimit] = useState(50);
    const [offset, setOffset] = useState(0);

    const { data, isLoading } = useProducts(limit, offset);
    const renderProducts = () => {
        if (isLoading) {
            return <div>Loading</div>;
        }

        if (!data?.length) {
            return <div>No items</div>;
        }

        return data.map((product) => <ProductTile key={product.id} product={product} />);
    };

    return (
        <>
            <div className="grid grid-cols-sidebar grid-rows-1">
                <Sidebar />
                <main className="border-l pr-20">
                    <div className="mb-5 flex justify-end pr-5">
                        <Pagination limit={limit} offset={offset} setOffset={setOffset} />
                    </div>
                    <div className="grid place-items-end gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">{renderProducts()}</div>
                </main>
            </div>
        </>
    );
};
