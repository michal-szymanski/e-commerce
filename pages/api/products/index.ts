import type { NextApiRequest, NextApiResponse } from 'next';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from '@/env.mjs';
import { mediaTable, productsTable } from '@/schema';
import { z } from 'zod';
import { eq, ilike } from 'drizzle-orm';
import { productWithMediaSchema } from '@/types';

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const parsedSearch = z.string().safeParse(req.query.search);
    const parsedLimit = z.coerce.number().min(0).max(100).safeParse(req.query.limit);
    const parsedOffset = z.coerce.number().min(0).safeParse(req.query.offset);

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

    res.status(200).json(parsedProducts);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            await handleGET(req, res);
        } else {
            res.status(405).end();
        }
    } catch (e) {
        console.error(e);
        res.status(422).json(e);
    }
}
