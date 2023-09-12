import Sidebar from '@/components/layouts/sidebar';
import Pagination from '@/components/ui/custom/pagination';
import ProductTile from '@/components/ui/custom/product-tile';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { ProductWithMedia, productWithMediaSchema } from '@/types';
import { z } from 'zod';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { mediaTable, productsTable } from '@/schema';
import { eq, ilike } from 'drizzle-orm';

export default ({ products }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const renderProducts = () => {
        if (!products.length) {
            return <div>No items</div>;
        }

        return products.map((product) => <ProductTile key={product.id} product={product} />);
    };

    return (
        <>
            <div className="grid grid-cols-sidebar grid-rows-1">
                <Sidebar />
                <main className="border-l pr-20">
                    <div className="mb-5 flex justify-end pr-5">
                        <Pagination />
                    </div>
                    <div className="grid place-items-end gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">{renderProducts()}</div>
                </main>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{ products: ProductWithMedia[] }> = async (context) => {
    const parsedSearch = z.string().safeParse(context.query.search);
    const parsedLimit = z.coerce.number().min(0).max(100).safeParse(context.query.limit);
    const parsedOffset = z.coerce.number().min(0).safeParse(context.query.offset);

    const search = parsedSearch.success ? parsedSearch.data : '';
    const limit = parsedLimit.success ? parsedLimit.data : 10;
    const offset = parsedOffset.success ? parsedOffset.data : 0;

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);

    const products = await db
        .select({
            id: productsTable.id,
            name: productsTable.name,
            description: productsTable.description,
            categoryId: productsTable.categoryId,
            price: productsTable.price,
            src: mediaTable.src,
            mimeType: mediaTable.mimeType
        })
        .from(productsTable)
        .where(ilike(productsTable.name, `%${search}%`))
        .orderBy(productsTable.name)
        .limit(limit)
        .offset(offset)
        .leftJoin(mediaTable, eq(productsTable.id, mediaTable.productId));

    await client.end();

    const parsedProducts = z.array(productWithMediaSchema).parse(products);

    return {
        props: {
            products: parsedProducts
        }
    };
};
