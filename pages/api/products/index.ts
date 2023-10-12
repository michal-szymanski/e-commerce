import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { productsTable } from '@/schema';
import { and, eq, ilike, SQL } from 'drizzle-orm';
import { searchProductSchema } from '@/types';

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const parsedName = z.string().safeParse(req.query.name);

    const name = parsedName.success ? parsedName.data : '';

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);

    const where: SQL[] = [eq(productsTable.active, true)];

    if (name) {
        where.push(ilike(productsTable.name, `%${name}%`));
    }

    const products = await db
        .select({ id: productsTable.id, name: productsTable.name })
        .from(productsTable)
        .where(and(...where))
        .limit(10);

    await client.end();

    res.status(200).json(z.array(searchProductSchema).parse(products));
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
