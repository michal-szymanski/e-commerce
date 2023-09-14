import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { mediaTable, productsTable } from '@/schema';
import { eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { productWithMediaSchema } from '@/types';

export const getProducts = async (search: string, limit: number, offset: number) => {
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

    return z.array(productWithMediaSchema).parse(products);
};

export const getProduct = async (id: number) => {
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
        .where(eq(productsTable.id, id))
        .leftJoin(mediaTable, eq(productsTable.id, mediaTable.productId));

    await client.end();

    return z.array(productWithMediaSchema).length(1).parse(products)[0];
};
