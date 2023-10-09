import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import stripe from '@/lib/stripe';
import { getAuth } from '@clerk/nextjs/server';

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userId, orgId } = getAuth(req);

    if (!userId || !orgId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, description, price } = z.object({ name: z.string(), description: z.string(), price: z.number() }).parse(req.body);
    const product = await stripe.products.create({
        name,
        description,
        default_price_data: {
            unit_amount: price,
            currency: 'pln'
        },
        metadata: {
            organizationId: orgId,
            categoryId: 1
        },
        images: [
            'https://images.unsplash.com/photo-1578849278619-e73505e9610f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80'
        ]
    });
    res.status(201).json(product);
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
