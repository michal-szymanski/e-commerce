import { useState } from 'react';
import { useProducts } from '@/hooks/queries';
import Image from 'next/image';
import Sidebar from '@/components/layouts/sidebar';

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

    if (isLoading) {
        return <div>Loading</div>;
    }

    if (!data?.length) {
        return <div>No items</div>;
    }

    return (
        <>
            <div className="grid grid-cols-sidebar grid-rows-1">
                <Sidebar />
                <main>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {data.map((product) => (
                            <div key={product.id} className="flex flex-col items-center">
                                <div>{product.name}</div>
                                <Image src={product.src} alt={product.name} width={200} height={200} />
                            </div>
                        ))}
                    </div>
                    <button onClick={handlePrev}>Prev</button>
                    <span>Page {1 + offset / limit}</span>
                    <button onClick={handleNext}>Next</button>
                </main>
            </div>
        </>
    );
};
