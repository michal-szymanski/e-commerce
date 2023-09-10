import { NextApiRequest, NextApiResponse } from 'next';
import { orderLinesTable, ordersTable } from '@/schema';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { z } from 'zod';
import { cartItemSchema } from '@/types';
import { getAuth } from '@clerk/nextjs/server';

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).end();
    }

    const cart = z.array(cartItemSchema).parse(req.body);

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);

    const orderResults = await db
        .insert(ordersTable)
        .values({
            userId,
            date: new Date().toISOString(),
            status: 'New'
        })
        .returning();

    const orderLinesResults = await db
        .insert(orderLinesTable)
        .values(
            cart.map((c) => ({
                orderId: orderResults[0].id,
                productId: c.product.id,
                quantity: z.coerce.string().parse(c.quantity)
            }))
        )
        .returning();

    await client.end();

    res.status(200).json({ order: orderResults[0], orderLines: orderLinesResults });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'POST') {
            await handlePost(req, res);
        } else {
            res.status(405).end();
        }
    } catch (e) {
        console.error(e);
        res.status(422).json(e);
    }
}
