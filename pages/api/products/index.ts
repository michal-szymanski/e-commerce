import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import stripe from '@/lib/stripe';
import { stripeProductSchema } from '@/types';

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const parsedName = z.string().safeParse(req.query.name);

    const name = parsedName.success ? parsedName.data : '';

    const response1 = await stripe.products.search({
        query: `active:\'true\'${name ? ` AND name:\'${name}\'` : ''}`,
        limit: 10,
        expand: ['data.default_price']
    });

    const response2 = await stripe.products.search({
        query: `active:\'true\'${name ? ` AND name~\'${name}\'` : ''}`,
        limit: 10,
        expand: ['data.default_price']
    });

    const products = response1.data
        .concat(response2.data.filter((p2) => !response1.data.some((p1) => p1.id === p2.id)))
        .sort((a, b) => ('' + a.name).localeCompare(b.name))
        .slice(0, 10);

    const searchResult = z.array(stripeProductSchema).parse(products);

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
