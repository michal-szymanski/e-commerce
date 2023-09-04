import type { NextApiRequest, NextApiResponse } from 'next';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from '@/env.mjs';
import { media, products } from '@/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const limit = z.coerce.number().parse(req.query.limit);
    const offset = z.coerce.number().parse(req.query.offset);

    const client = postgres(env.CONNECTION_STRING, {});
    const db = drizzle(client);

    const data = await db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            categoryId: products.categoryId,
            price: products.price,
            src: media.src,
            mimeType: media.mimeType
        })
        .from(products)
        .orderBy(products.id)
        .limit(limit)
        .offset(offset)
        .leftJoin(media, eq(products.id, media.productId));

    await client.end();

    res.status(200).json(data);
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
