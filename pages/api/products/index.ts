import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import stripe from '@/stripe';
import { stripeSearchResultSchema } from '@/types';

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const parsedName = z.string().safeParse(req.query.name);
    const parsedLimit = z.coerce.number().min(0).max(100).safeParse(req.query.limit);

    const name = parsedName.success ? parsedName.data : '';
    const limit = parsedLimit.success ? parsedLimit.data : 10;

    const response = await stripe.products.search({
        query: `active:\'true\'${name ? ` AND name~\'${name}\'` : ''}`,
        limit
    });

    const searchResult = stripeSearchResultSchema.parse(response);

    res.status(200).json(searchResult);
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
