import Sidebar from '@/components/layouts/sidebar';
import Pagination from '@/components/ui/custom/pagination';
import ProductTile from '@/components/ui/custom/product-tile';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { StripeProductSearchResult, stripeSearchResultSchema } from '@/types';
import Link from 'next/link';
import { getProductUrl } from '@/lib/utils';
import stripe from '@/stripe';
import { env } from '@/env.mjs';
import Head from 'next/head';

export default ({ searchResult }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const renderProducts = () => {
        if (!searchResult.data?.length) {
            return <div>No items</div>;
        }

        return searchResult.data.map((product) => (
            <Link key={product.id} href={getProductUrl(product.id, product.name)}>
                <ProductTile product={product} />
            </Link>
        ));
    };

    return (
        <>
            <Head>
                <title>Products | {env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className="grid grid-cols-sidebar grid-rows-1">
                <Sidebar />
                <div className="border-l pr-20">
                    <div className="mb-5 flex justify-end pr-5">
                        <Pagination nextPage={searchResult.next_page ?? ''} />
                    </div>
                    <div className="grid place-items-end gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">{renderProducts()}</div>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{ searchResult: StripeProductSearchResult }> = async (context) => {
    const parsedName = z.string().safeParse(context.query.name);
    const parsedLimit = z.coerce.number().min(0).max(100).safeParse(context.query.limit);
    const parsedPage = z.string().safeParse(context.query.page);

    const name = parsedName.success ? parsedName.data : '';
    const limit = parsedLimit.success ? parsedLimit.data : 10;
    const page = parsedPage.success ? parsedPage.data : '';

    const requestConfig: Record<string, string | number | string[]> = {
        query: `active:\'true\'${name ? ` AND name~\'${name}\'` : ''}`,
        limit,
        expand: ['data.default_price']
    };

    if (page) {
        requestConfig.page = page;
    }

    const response = await stripe.products.search(requestConfig);

    const searchResult = stripeSearchResultSchema.parse(response);

    return {
        props: {
            searchResult
        }
    };
};
