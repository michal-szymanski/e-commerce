import stripe from '@/lib/stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { orderHistoriesTable, ordersTable } from '@/schema';
import { inArray } from 'drizzle-orm';
import db from '@/lib/drizzle';
import { z } from 'zod';
import { cartItemSchema } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { userId } = getAuth(req);

            const cartItems = z.array(cartItemSchema).parse(req.body);

            if (!cartItems.length) {
                return res.status(400).end();
            }

            const cartOrganizationIds = [...new Set(cartItems.map((c) => c.product.organizationId))];

            const orders = await db
                .insert(ordersTable)
                .values(cartOrganizationIds.map((organizationId) => ({ userId, organizationId })))
                .returning();

            const orderIds = orders.map((o) => o.id);
            const now = new Date().toISOString();

            await db.insert(orderHistoriesTable).values(orderIds.map((orderId) => ({ orderId, status: 'Pending', date: now }) as const));

            // Create Checkout Sessions from body params.
            const session = await stripe.checkout.sessions.create({
                line_items: cartItems.map((c) => ({
                    price: c.product.priceId,
                    quantity: c.quantity
                })),
                mode: 'payment',
                success_url: `${req.headers.origin}/order-confirmation/{CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}`,
                metadata: {
                    orderIds: JSON.stringify(orderIds),
                    userId
                }
            });

            await db.update(ordersTable).set({ checkoutSessionId: session.id }).where(inArray(ordersTable.id, orderIds));

            if (session.url) {
                return res.status(201).json({ sessionUrl: session.url });
            }

            res.status(500).json({ error: 'Missing url for checkout session' });
        } catch (err: any) {
            console.error(err);
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
