import { NextApiRequest, NextApiResponse } from 'next';
import { cartItemsTable, imagesTable, orderHistoriesTable, pricesTable, productsTable } from '@/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { z } from 'zod';
import db from '@/lib/drizzle';

type CheckoutSession = Stripe.Checkout.Session & { orderIds: string; userId: string };
type Product = Stripe.Product & { metadata: { organizationId: string; categoryId: string } };

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    const event = req.body as Stripe.Event;

    switch (event.type) {
        case 'checkout.session.completed': {
            const checkoutSession = event.data.object as CheckoutSession;

            if (!checkoutSession.metadata) break;

            const orderIds = z.array(z.number()).parse(JSON.parse(checkoutSession.metadata.orderIds));
            const userId = z.string().parse(checkoutSession.metadata.userId);
            const now = new Date().toISOString();

            await db.insert(orderHistoriesTable).values(orderIds.map((orderId) => ({ orderId, status: 'New', date: now }) as const));
            await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
            break;
        }
        case 'price.created': {
            const price = event.data.object as Stripe.Price;

            await db.insert(pricesTable).values({
                id: price.id,
                unitAmount: price.unit_amount as number,
                currency: price.currency,
                active: price.active
            });
            break;
        }
        case 'price.updated': {
            const price = event.data.object as Stripe.Price;

            await db
                .update(pricesTable)
                .set({
                    unitAmount: price.unit_amount as number,
                    currency: price.currency,
                    active: price.active
                })
                .where(eq(pricesTable.id, price.id));
            break;
        }
        case 'price.deleted': {
            const price = event.data.object as Stripe.Price;

            await db.delete(pricesTable).where(eq(pricesTable.id, price.id));
            break;
        }
        case 'product.created': {
            const product = event.data.object as Product;

            if (!product.metadata) break;

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
            break;
        }
        case 'product.updated': {
            const product = event.data.object as Stripe.Product;

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
            break;
        }
        case 'product.deleted': {
            const product = event.data.object as Stripe.Product;

            await db.delete(productsTable).where(eq(productsTable.id, product.id));
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
