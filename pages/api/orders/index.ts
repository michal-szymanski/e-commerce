import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { orderHistoriesTable } from '@/schema';
import { z } from 'zod';
import { orderSchema } from '@/types';
import { getCartOrders } from '@/sql-service';

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).end();
    }

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);

    const orders = await getCartOrders(db, userId);

    const order = z.array(orderSchema).length(1).parse(orders)[0];

    await db.insert(orderHistoriesTable).values({
        orderId: order.id,
        status: 'Pending',
        date: new Date().toISOString()
    });

    await client.end();

    res.status(200).json({ orderId: order.id });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'POST') {
            await handlePOST(req, res);
        } else {
            res.status(405).end();
        }
    } catch (e) {
        console.error(e);
        res.status(422).json(e);
    }
}
