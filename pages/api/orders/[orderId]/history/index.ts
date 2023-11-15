import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { orderHistorySchema, orderSchema, orderStatusSchema } from '@/types';
import db from '@/lib/drizzle';
import { orderHistoriesTable, ordersTable } from '@/schema';
import { eq } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const orderId = z.coerce.number().parse(req.query.orderId);

    const order = orderSchema.parse((await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)))[0]);

    const { userId, orgId } = getAuth(req);

    if (order.userId !== userId && order.organizationId !== orgId) {
        return res.status(401).end();
    }

    const orderHistories = await db.select().from(orderHistoriesTable).where(eq(orderHistoriesTable.orderId, order.id));

    res.status(200).json(z.array(orderHistorySchema).parse(orderHistories));
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const orderId = z.coerce.number().parse(req.query.orderId);
    const { status } = z.object({ status: orderStatusSchema }).parse(req.body);

    const order = orderSchema.parse((await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)))[0]);

    const { orgId } = getAuth(req);

    if (order.organizationId !== orgId) {
        return res.status(401).end();
    }

    const orderHistory = await db.insert(orderHistoriesTable).values({ orderId, status, date: new Date().toISOString() }).returning();

    res.status(201).json(orderHistorySchema.parse(orderHistory[0]));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            await handleGET(req, res);
        } else if (req.method === 'POST') {
            await handlePOST(req, res);
        } else {
            res.status(405).end();
        }
    } catch (e) {
        console.error(e);
        res.status(422).json(e);
    }
}
