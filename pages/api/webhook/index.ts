import { NextApiRequest, NextApiResponse } from 'next';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { imagesTable, orderHistoriesTable, orderLinesTable, pricesTable, productsTable } from '@/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

type CheckoutSession = Stripe.Checkout.Session & { orderId: string };
type Product = Stripe.Product & { metadata: { organizationId: string; categoryId: string } };

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    const event = req.body as Stripe.Event;

    switch (event.type) {
        case 'checkout.session.completed': {
            const checkoutSession = event.data.object as CheckoutSession;

            if (!checkoutSession.metadata) break;

            const { orderId } = checkoutSession.metadata;
            const client = postgres(env.CONNECTION_STRING);
            const db = drizzle(client);
            await db.insert(orderHistoriesTable).values({
                orderId: Number(orderId),
                status: 'In Progress',
                date: new Date().toISOString()
            });
            await db.delete(orderLinesTable).where(eq(orderLinesTable.orderId, Number(orderId)));
            await client.end();
            break;
        }
        case 'price.created': {
            const price = event.data.object as Stripe.Price;
            const client = postgres(env.CONNECTION_STRING);
            const db = drizzle(client);
            await db.insert(pricesTable).values({
                id: price.id,
                unitAmount: price.unit_amount as number,
                currency: price.currency,
                active: price.active
            });
            await client.end();
            break;
        }
        case 'price.updated': {
            const price = event.data.object as Stripe.Price;
            const client = postgres(env.CONNECTION_STRING);
            const db = drizzle(client);
            await db
                .update(pricesTable)
                .set({
                    unitAmount: price.unit_amount as number,
                    currency: price.currency,
                    active: price.active
                })
                .where(eq(pricesTable.id, price.id));
            await client.end();
            break;
        }
        case 'price.deleted': {
            const price = event.data.object as Stripe.Price;
            const client = postgres(env.CONNECTION_STRING);
            const db = drizzle(client);
            await db.delete(pricesTable).where(eq(pricesTable.id, price.id));
            await client.end();
            break;
        }
        case 'product.created': {
            const product = event.data.object as Product;

            if (!product.metadata) break;

            const client = postgres(env.CONNECTION_STRING);
            const db = drizzle(client);
            const dbProduct = (
                await db
                    .insert(productsTable)
                    .values({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        active: product.active,
                        organizationId: product.metadata.organizationId,
                        categoryId: Number(product.metadata.categoryId),
                        priceId: product.default_price as string
                    })
                    .returning()
            )[0];

            const images = product.images.map((src, i) => ({ productId: dbProduct.id, sequence: i, src }));
            await db.insert(imagesTable).values(images);
            await client.end();
            break;
        }
        case 'product.updated': {
            const product = event.data.object as Stripe.Product;
            const client = postgres(env.CONNECTION_STRING);
            const db = drizzle(client);
            await db
                .update(productsTable)
                .set({
                    name: product.name,
                    description: product.description,
                    active: product.active,
                    organizationId: product.metadata.organizationId,
                    categoryId: Number(product.metadata.categoryId),
                    priceId: product.default_price as string
                })
                .where(eq(productsTable.id, product.id));
            await client.end();
            break;
        }
        case 'product.deleted': {
            const product = event.data.object as Stripe.Product;
            const client = postgres(env.CONNECTION_STRING);
            const db = drizzle(client);
            await db.delete(productsTable).where(eq(productsTable.id, product.id));
            await client.end();
            break;
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
