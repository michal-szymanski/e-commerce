import Sidebar from '@/components/layouts/sidebar';
import ProductTile from '@/components/ui/custom/product-tile';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { env } from '@/env.mjs';
import Head from 'next/head';
import { imagesTable, pricesTable, productsTable } from '@/schema';
import { and, eq, ilike, inArray, SQL } from 'drizzle-orm';
import db from '@/lib/drizzle';
import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

const Page = ({ products }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const renderProducts = () => {
        if (!products.length) {
            return <div>No items</div>;
        }

        return products.map((product) => <ProductTile key={product.id} product={product} />);
    };

    return (
        <>
            <Head>
                <title>{`Products | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex flex-col gap-5 lg:flex-row">
                <div className="hidden border-r pr-10 lg:block lg:w-80">
                    <Sidebar />
                </div>
                <div className="self-end lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button type="button" variant="secondary" className="flex gap-5">
                                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                                <span>Filters</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetTitle className="pb-10">Filters</SheetTitle>
                            <Sidebar />
                        </SheetContent>
                    </Sheet>
                </div>
                <div className="flex-1 lg:p-10">
                    {/*<div className="mb-5 flex justify-end pr-5">*/}
                    {/*    <Pagination nextPage={searchResult.next_page ?? ''} />*/}
                    {/*</div>*/}
                    <div className="flex flex-col gap-5">{renderProducts()}</div>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{
    products: {
        id: string;
        name: string;
        description: string | null;
        unitAmount: number;
        currency: string;
        organizationId: string;
        priceId: string;
        images: string[];
    }[];
}> = async (context) => {
    const parsedName = z.string().safeParse(context.query.name);
    const parsedLimit = z.coerce.number().min(0).max(100).safeParse(context.query.limit);
    const parsedPage = z.string().safeParse(context.query.page);
    const parsedCategoryId = z.coerce.number().safeParse(context.query.categoryId);

    const name = parsedName.success ? parsedName.data : '';
    const limit = parsedLimit.success ? parsedLimit.data : 10;
    const page = parsedPage.success ? parsedPage.data : '';
    const category = parsedCategoryId.success ? parsedCategoryId.data : null;

    const where: SQL[] = [eq(productsTable.active, true)];

    if (name) {
        where.push(ilike(productsTable.name, `%${name}%`));
    }
    if (category) {
        where.push(eq(productsTable.categoryId, category));
    }

    const products = await db
        .select({
            id: productsTable.id,
            name: productsTable.name,
            description: productsTable.description,
            unitAmount: pricesTable.unitAmount,
            currency: pricesTable.currency,
            organizationId: productsTable.organizationId,
            priceId: pricesTable.id
        })
        .from(productsTable)
        .innerJoin(pricesTable, eq(productsTable.priceId, pricesTable.id))
        .where(and(...where));

    if (!products.length) {
        return {
            props: {
                products: []
            }
        };
    }

    const media = await db
        .select({ productId: imagesTable.productId, src: imagesTable.src, sequence: imagesTable.sequence })
        .from(imagesTable)
        .where(
            inArray(
                imagesTable.productId,
                products.map((p) => p.id)
            )
        );

    return {
        props: {
            products: products.map((p) => ({
                ...p,
                images: media
                    .filter((m) => m.productId === p.id)
                    .sort((a, b) => a.sequence - b.sequence)
                    .map(({ src }) => src)
            }))
        }
    };
};

Page.getLayout = (page: ReactNode) => {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export default Page;
