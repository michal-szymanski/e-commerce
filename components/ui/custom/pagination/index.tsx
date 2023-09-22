import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';

type Props = {
    nextPage: string;
};

const Pagination = ({ nextPage }: Props) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const name = searchParams.get('name') ?? '';
    const page = searchParams.get('page') ?? '';
    const prevPage = searchParams.get('prevPage') ?? '';

    type QueryString = {
        name?: string;
        page?: string;
        prevPage?: string;
    };

    const handleNext = async () => {
        const query: QueryString = {};

        if (name) {
            query.name = name;
        }

        if (nextPage) {
            query.page = nextPage;
        }

        if (page) {
            query.prevPage = page;
        }

        await router.push({
            pathname: '/products',
            query
        });
    };

    const handlePrev = async () => {
        const query: QueryString = {};

        if (name) {
            query.name = name;
        }

        if (prevPage) {
            query.page = prevPage;
        }

        await router.push({
            pathname: '/products',
            query
        });
    };

    return (
        <div className="flex gap-3">
            <Button
                variant="outline"
                onClick={handlePrev}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent p-0 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                disabled={!page && !prevPage}
            >
                <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                onClick={handleNext}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent p-0 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                disabled={!nextPage}
            >
                <ChevronRightIcon className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default Pagination;
