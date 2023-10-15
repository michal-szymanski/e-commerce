import { NextApiRequest, NextApiResponse } from 'next';
import { cartItemsTable } from '@/schema';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { z } from 'zod';
import { cartItemSchema } from '@/types';
import { getAuth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { getCartItems } from '@/sql-service';

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(200).json([]);
    }

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);

    const cartItems = await getCartItems(db, userId);

    await client.end();

    return res.status(200).json(cartItems);
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).end();
    }

    const cart = z.array(cartItemSchema).parse(req.body);

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);

    for (let cartItem of cart) {
        const cartItems = await db
            .select()
            .from(cartItemsTable)
            .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, cartItem.product.id)));

        if (cartItems.length) {
            if (Number(cartItems[0].quantity) !== cartItem.quantity) {
                if (cartItem.quantity > 0) {
                    await db
                        .update(cartItemsTable)
                        .set({ quantity: String(cartItem.quantity) })
                        .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, cartItem.product.id)));
                } else {
                    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, cartItem.product.id)));
                }
            }
        } else {
            await db.insert(cartItemsTable).values({ quantity: String(cartItem.quantity), productId: cartItem.product.id, userId });
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
