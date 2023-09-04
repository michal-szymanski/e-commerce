import { useState } from 'react';
import { useProducts } from '@/hooks/queries';
import Image from 'next/image';

export default () => {
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);

    const { data } = useProducts(limit, offset);

    const handlePrev = () => {
        if (offset === 0) return;

        setOffset((prevState) => prevState - limit);
    };

    const handleNext = () => {
        setOffset((prevState) => prevState + limit);
    };

    if (!data?.length) {
        return <div>No items</div>;
    }

    return (
        <main className="border-amber-950 border-2">
            <div className="grid gap-3 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
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
    );
};
