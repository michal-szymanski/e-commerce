import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';

const limit = 10;

const Pagination = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const search = searchParams.get('search') ?? '';
    const offset = Number(searchParams.get('offset') ?? 0);

    const pageNumber = 1 + offset / limit;

    const handleNext = async () => {
        const query: { search?: string; offset?: number } = {};

        if (search) {
            query.search = search;
        }

        query.offset = offset + limit;

        await router.push({
            pathname: '/products',
            query
        });
    };

    const handlePrev = async () => {
        if (pageNumber === 1) return;

        const query: { search?: string; offset?: number } = {};

        if (search) {
            query.search = search;
        }

        if (pageNumber > 2) {
            query.offset = offset - limit;
        }

        await router.push({
            pathname: '/products',
            query
        });
    };

    return (
        <div className="flex gap-3">
            <span className="flex w-[100px] items-center justify-center text-sm font-medium">Page {pageNumber}</span>
            <Button
                variant="outline"
                onClick={handlePrev}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent p-0 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                disabled={pageNumber === 1}
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
