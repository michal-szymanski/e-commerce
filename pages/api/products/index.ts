import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getProducts } from '@/sql-service';

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const parsedSearch = z.string().safeParse(req.query.search);
    const parsedLimit = z.coerce.number().min(0).max(100).safeParse(req.query.limit);
    const parsedOffset = z.coerce.number().min(0).safeParse(req.query.offset);

    const search = parsedSearch.success ? parsedSearch.data : '';
    const limit = parsedLimit.success ? parsedLimit.data : 10;
    const offset = parsedOffset.success ? parsedOffset.data : 0;

    const products = await getProducts(search, limit, offset, 'api');

    res.status(200).json(products);
};

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
