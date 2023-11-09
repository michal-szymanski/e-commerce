import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { categoryNameEnumSchema, categorySchema } from '@/types';
import { ReactElement } from 'react';
import { AppleIcon, BabyIcon, BedDoubleIcon, CarIcon, CatIcon, DumbbellIcon, HeartPulseIcon, MonitorIcon, MusicIcon, Shirt } from 'lucide-react';
import { z } from 'zod';

type Props = {
    categories: z.infer<typeof categorySchema>[];
};

type CategoryName = keyof typeof categoryNameEnumSchema.enum;

const iconMap: Record<CategoryName, ReactElement> = {
    Food: <AppleIcon className="h-5 w-5" />,
    Automotive: <CarIcon className="h-5 w-5" />,
    Clothes: <Shirt className="h-5 w-5" />,
    Electronics: <MonitorIcon className="h-5 w-5" />,
    Furniture: <BedDoubleIcon className="h-5 w-5" />,
    Health: <HeartPulseIcon className="h-5 w-5" />,
    Music: <MusicIcon className="h-5 w-5" />,
    Sport: <DumbbellIcon className="h-5 w-5" />,
    'For Animals': <CatIcon className="h-5 w-5" />,
    'For Kids': <BabyIcon className="h-5 w-5" />
};

const ProductCategories = ({ categories }: Props) => (
    <Card className="lg:min-w-[250px]">
        <CardHeader>
            <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="w-full">
                {categories.map((c) => (
                    <li key={c.id}>
                        <Button type="button" variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" asChild>
                            <Link href={`/products?categoryId=${c.id}`}>
                                {iconMap[c.name]}
                                {c.name}
                            </Link>
                        </Button>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

export default ProductCategories;
