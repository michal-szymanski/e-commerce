import stripe from '@/stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { CartItem, orderLineSchema, orderSchema, StripePrice, stripeProductSchema } from '@/types';
import { getAuth } from '@clerk/nextjs/server';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getCartOrders } from '@/sql-service';
import { orderHistoriesTable, orderLinesTable, ordersTable } from '@/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { userId } = getAuth(req);

            if (!userId) {
                return res.status(401).end();
            }

            const client = postgres(env.CONNECTION_STRING);
            const db = drizzle(client);

            const orders = await getCartOrders(db, userId);

            const parsedOrders = z.array(orderSchema).length(1).safeParse(orders);

            const cartItems: CartItem[] = [];

            if (!parsedOrders.success) {
                return res.status(422).end();
            }

            const orderLines = await db
                .select()
                .from(orderLinesTable)
                .where(eq(orderLinesTable.orderId, parsedOrders.data[0].id))
                .orderBy(orderLinesTable.productId);

            const parsedOrderLines = z.array(orderLineSchema).parse(orderLines);

            for (let ol of parsedOrderLines) {
                const product = await stripe.products.retrieve(ol.productId, {
                    expand: ['default_price']
                });

                cartItems.push({ product: stripeProductSchema.parse(product), quantity: Number(ol.quantity) });
            }

            // Create Checkout Sessions from body params.
            const session = await stripe.checkout.sessions.create({
                line_items: cartItems.map((c) => ({
                    price: (c.product.default_price as StripePrice).id,
                    quantity: c.quantity
                })),
                mode: 'payment',
                success_url: `${req.headers.origin}/?success=true`,
                cancel_url: `${req.headers.origin}/?canceled=true`
            });

            const now = new Date().toISOString();
            await db.update(ordersTable).set({ checkoutSessionId: session.id }).where(eq(ordersTable.id, parsedOrders.data[0].id));
            await db.insert(orderHistoriesTable).values({ orderId: parsedOrders.data[0].id, date: now, status: 'Pending' });
            await db.delete(orderLinesTable).where(eq(orderLinesTable.orderId, parsedOrders.data[0].id));

            await client.end();

            res.redirect(303, session.url);
        } catch (err: any) {
            console.error(err);
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
