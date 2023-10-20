import Sidebar from '@/components/layouts/sidebar';
import ProductTile from '@/components/ui/custom/product-tile';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import Link from 'next/link';
import { getProductPageUrl } from '@/lib/utils';
import { env } from '@/env.mjs';
import Head from 'next/head';
import { imagesTable, pricesTable, productsTable } from '@/schema';
import { and, eq, ilike, inArray, SQL } from 'drizzle-orm';
import db from '@/lib/drizzle';
import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';

const Page = ({ products }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const renderProducts = () => {
        if (!products.length) {
            return <div>No items</div>;
        }

        return products.map((product) => (
            <Link key={product.id} href={getProductPageUrl(product.id, product.name)}>
                <ProductTile product={product} />
            </Link>
        ));
    };

    return (
        <>
            <Head>
                <title>{`Products | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="grid grid-cols-sidebar grid-rows-1">
                <Sidebar />
                <div className="border-l pr-20">
                    {/*<div className="mb-5 flex justify-end pr-5">*/}
                    {/*    <Pagination nextPage={searchResult.next_page ?? ''} />*/}
                    {/*</div>*/}
                    <div className="grid place-items-end gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">{renderProducts()}</div>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{
    products: { id: string; name: string; unitAmount: number; currency: string; images: string[] }[];
}> = async (context) => {
    const parsedName = z.string().safeParse(context.query.name);
    const parsedLimit = z.coerce.number().min(0).max(100).safeParse(context.query.limit);
    const parsedPage = z.string().safeParse(context.query.page);

    const name = parsedName.success ? parsedName.data : '';
    const limit = parsedLimit.success ? parsedLimit.data : 10;
    const page = parsedPage.success ? parsedPage.data : '';

    const where: SQL[] = [eq(productsTable.active, true)];

    if (name) {
        where.push(ilike(productsTable.name, `%${name}%`));
    }

    const products = await db
        .select({
            id: productsTable.id,
            name: productsTable.name,
            description: productsTable.description,
            unitAmount: pricesTable.unitAmount,
            currency: pricesTable.currency
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
