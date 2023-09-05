import { useState } from 'react';
import { useProducts } from '@/hooks/queries';
import Image from 'next/image';
import Sidebar from '@/components/layouts/sidebar';
import Pagination from '@/components/ui/custom/pagination';
import ProductTile from '@/components/ui/custom/product-tile';

export default () => {
    const [limit, setLimit] = useState(50);
    const [offset, setOffset] = useState(0);

    const { data, isLoading } = useProducts(limit, offset);

    const handlePrev = () => {
        if (offset === 0) return;

        setOffset((prevState) => prevState - limit);
    };

    const handleNext = () => {
        setOffset((prevState) => prevState + limit);
    };

    const renderProducts = () => {
        if (!data?.length) {
            return <div>No items</div>;
        }

        return data.map((product) => <ProductTile key={product.id} product={product} />);
    };

    if (isLoading) {
        return <div>Loading</div>;
    }

    return (
        <>
            <div className="grid grid-cols-sidebar grid-rows-1">
                <Sidebar />
                <main className="border-l border-b-gray-400 pr-20">
                    <div className="flex justify-end">
                        <Pagination limit={limit} offset={offset} setOffset={setOffset} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{renderProducts()}</div>
                </main>
            </div>
        </>
    );
};
