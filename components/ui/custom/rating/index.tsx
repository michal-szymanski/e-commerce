import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline';

type Props = {
    value: number;
    count: number;
};

const Rating = ({ value, count }: Props) => {
    return (
        <div className="flex gap-1">
            <div className="flex font-medium text-amber-200">
                {Array.from({ length: 5 }).map((_, v) => (v < value ? <SolidStarIcon className="h-4 w-4 " /> : <OutlineStarIcon className="h-4 w-4" />))}
            </div>
            <div className="text-sm text-gray-400">({count})</div>
        </div>
    );
};

export default Rating;
