import { NextApiRequest, NextApiResponse } from 'next';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { orderHistoriesTable } from '@/schema';

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    const event = req.body;

    if (event.type === 'checkout.session.completed') {
        const checkoutSession = event.data.object;
        const { orderId } = checkoutSession.metadata;

        const client = postgres(env.CONNECTION_STRING);
        const db = drizzle(client);
        await db.insert(orderHistoriesTable).values({ orderId, status: 'In Progress', date: new Date().toISOString() });
        await client.end();
    }

    res.status(200).json({ received: true });
};
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
