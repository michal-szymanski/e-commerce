import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import stripe from '@/lib/stripe';

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userId, orgId } = getAuth(req);

    if (!userId || !orgId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, description, unitAmount, priceId } = z
        .object({ priceId: z.string(), name: z.string(), description: z.string(), unitAmount: z.number() })
        .parse(req.body);
    const id = z.string().parse(req.query.id);

    const price = await stripe.prices.create({
        currency: 'pln',
        unit_amount: unitAmount,
        product: id
    });

    const product = await stripe.products.update(id, {
        name,
        description,
        default_price: price.id
    });

    await stripe.prices.update(priceId, {
        active: false
    });

    product.default_price = price;

    return res.status(200).json(product);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'PUT') {
            await handlePUT(req, res);
        } else {
            res.status(405).end();
        }
    } catch (e) {
        console.error(e);
        res.status(422).json(e);
    }
}
