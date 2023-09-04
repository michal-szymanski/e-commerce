import { useState } from 'react';
import { useProducts } from '@/hooks/queries';

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

    return (
        <main className="border-amber-950 border-2">
            <div>{JSON.stringify(data)}</div>
            <button onClick={handlePrev}>Prev</button>
            <span>Page {1 + offset / limit}</span>
            <button onClick={handleNext}>Next</button>
        </main>
    );
};
