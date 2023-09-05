import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type Props = {
    limit: number;
    offset: number;
    setOffset: Dispatch<SetStateAction<number>>;
};
const Pagination = ({ limit, offset, setOffset }: Props) => {
    const handlePrev = () => {
        if (offset === 0) return;

        setOffset((prevState) => prevState - limit);
    };

    const handleNext = () => {
        setOffset((prevState) => prevState + limit);
    };

    return (
        <div className="flex gap-3">
            <span className="flex w-[100px] items-center justify-center text-sm font-medium">Page {1 + offset / limit}</span>
            <Button
                variant="outline"
                onClick={handlePrev}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent p-0 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
                <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                onClick={handleNext}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent p-0 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
                <ChevronRightIcon className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default Pagination;
