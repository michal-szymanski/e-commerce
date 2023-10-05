import { NextApiRequest, NextApiResponse } from 'next';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { orderHistoriesTable, orderLinesTable } from '@/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    const event = req.body as Stripe.Event;

    if (event.type === 'checkout.session.completed') {
        const checkoutSession = event.data.object as Stripe.Checkout.Session & { orderId: string };

        if (checkoutSession.metadata) {
            const { orderId } = checkoutSession.metadata;
            const client = postgres(env.CONNECTION_STRING);
            const db = drizzle(client);
            await db.insert(orderHistoriesTable).values({ orderId: Number(orderId), status: 'In Progress', date: new Date().toISOString() });
            await db.delete(orderLinesTable).where(eq(orderLinesTable.orderId, Number(orderId)));
            await client.end();
        }
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
