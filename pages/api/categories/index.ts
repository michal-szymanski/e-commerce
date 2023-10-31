import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import db from '@/lib/drizzle';
import { categoriesTable } from '@/schema';
import { categorySchema } from '@/types';

async function handleGET(_req: NextApiRequest, res: NextApiResponse) {
    const categories = await db.select().from(categoriesTable);

    res.status(200).json(z.array(categorySchema).parse(categories));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            await handleGET(req, res);
        } else {
            res.status(405).end();
        }
    } catch (e) {
        console.error(e);
        res.status(422).json(e);
    }
}
