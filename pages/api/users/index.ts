import { NextApiRequest, NextApiResponse } from 'next';
import { ordersTable } from '@/schema';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import db from '@/lib/drizzle';

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).end();
    }

    await clerkClient.users.deleteUser(userId);
    await db.update(ordersTable).set({ userId: null }).where(eq(ordersTable.userId, userId));
    res.status(200).end();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'DELETE') {
            await handleDELETE(req, res);
        } else {
            res.status(405).end();
        }
    } catch (e) {
        console.error(e);
        res.status(422).json(e);
    }
}
