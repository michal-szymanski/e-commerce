import type { NextApiRequest, NextApiResponse } from 'next';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from '@/env.mjs';
import { mediaTable, productsTable } from '@/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const limit = z.coerce.number().parse(req.query.limit);
    const offset = z.coerce.number().parse(req.query.offset);

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
        .orderBy(productsTable.id)
        .limit(limit)
        .offset(offset)
        .leftJoin(mediaTable, eq(productsTable.id, mediaTable.productId));

    await client.end();

    res.status(200).json(products);
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
