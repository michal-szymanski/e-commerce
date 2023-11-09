import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';
import ProductCategories from '@/components/ui/custom/product-categories';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import db from '@/lib/drizzle';
import { categoriesTable } from '@/schema';
import { z } from 'zod';
import { categorySchema } from '@/types';
import HeroImage from '@/components/ui/custom/hero-image';

const Page = ({ categories }: InferGetStaticPropsType<typeof getStaticProps>) => {
    return (
        <div className="container relative">
            <HeroImage />
            <div className="top-1/2 pt-5 lg:left-44 xl:absolute xl:-translate-y-1/2 xl:pt-0">
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
