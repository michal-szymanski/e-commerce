import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import ProductCategories from '@/components/ui/custom/product-categories';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import db from '@/lib/drizzle';
import { categoriesTable } from '@/schema';
import { z } from 'zod';
import { categorySchema } from '@/types';

const Page = ({ categories }: InferGetStaticPropsType<typeof getStaticProps>) => {
    return (
        <div className="container relative">
            <AspectRatio ratio={16 / 9} className="bg-muted">
                <Image
                    src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                    alt="Photo by Drew Beamer"
                    fill
                    className="rounded-md object-cover"
                    priority
                />
            </AspectRatio>
            <div className="top-1/2 pt-5 lg:absolute lg:left-44 lg:-translate-y-1/2 lg:pt-0">
                <ProductCategories categories={categories} />
            </div>
        </div>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export const getStaticProps: GetStaticProps<{ categories: z.infer<typeof categorySchema>[] }> = async () => {
    const categories = z.array(categorySchema).parse(await db.select().from(categoriesTable));

    return {
        props: {
            categories
        }
    };
};

export default Page;
