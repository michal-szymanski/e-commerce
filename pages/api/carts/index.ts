import { NextApiRequest, NextApiResponse } from 'next';
import { mediaTable, orderHistoriesTable, orderLinesTable, ordersTable, productsTable } from '@/schema';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { z } from 'zod';
import { cartItemSchema, Order, orderSchema } from '@/types';
import { getAuth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { getCartOrders } from '@/sql-service';

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).end();
    }

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);

    const orders = await getCartOrders(db, userId);

    const parsedOrders = z.array(orderSchema).length(1).safeParse(orders);

    if (parsedOrders.success) {
        const cartItems = await db
            .select({
                product: {
                    id: productsTable.id,
                    name: productsTable.name,
                    categoryId: productsTable.categoryId,
                    description: productsTable.description,
                    price: productsTable.price,
                    src: mediaTable.src,
                    mimeType: mediaTable.mimeType
                },
                quantity: orderLinesTable.quantity
            })
            .from(orderLinesTable)
            .leftJoin(ordersTable, eq(ordersTable.id, orderLinesTable.orderId))
            .leftJoin(productsTable, eq(productsTable.id, orderLinesTable.productId))
            .leftJoin(mediaTable, eq(mediaTable.productId, productsTable.id))
            .where(eq(ordersTable.id, parsedOrders.data[0].id))
            .orderBy(orderLinesTable.productId);

        await client.end();

        return res.status(200).json(cartItems.map((c) => ({ ...c, quantity: Number(c.quantity) })));
    }

    await client.end();

    res.status(200).json([]);
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).end();
    }

    const cart = z.array(cartItemSchema).parse(req.body);

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);

    let order: Order;

    const orders = await getCartOrders(db, userId);

    if (!orders.length) {
        order = (await db.insert(ordersTable).values({ userId }).returning())[0];

        await db.insert(orderHistoriesTable).values({
            orderId: order.id,
            status: 'New',
            date: new Date().toISOString()
        });
    } else {
        order = orders[0];
    }

    for (let cartItem of cart) {
        const orderLines = await db
            .select()
            .from(orderLinesTable)
            .where(and(eq(orderLinesTable.orderId, order.id), eq(orderLinesTable.productId, cartItem.product.id)));

        if (orderLines.length) {
            if (Number(orderLines[0].quantity) !== cartItem.quantity) {
                if (cartItem.quantity > 0) {
                    await db
                        .update(orderLinesTable)
                        .set({ quantity: String(cartItem.quantity) })
                        .where(and(eq(orderLinesTable.orderId, order.id), eq(orderLinesTable.productId, cartItem.product.id)));
                } else {
                    await db.delete(orderLinesTable).where(and(eq(orderLinesTable.orderId, order.id), eq(orderLinesTable.productId, cartItem.product.id)));
                }
            }
        } else {
            await db.insert(orderLinesTable).values({ orderId: order.id, quantity: String(cartItem.quantity), productId: cartItem.product.id });
        }
    }

    await client.end();

    res.status(200).end();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'POST') {
            await handlePOST(req, res);
        } else if (req.method === 'GET') {
            await handleGET(req, res);
        } else {
            res.status(405).end();
        }
    } catch (e) {
        console.error(e);
        res.status(422).json(e);
    }
}
