import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import stripe from '@/lib/stripe';
import { getAuth } from '@clerk/nextjs/server';

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userId, orgId } = getAuth(req);

    if (!userId || !orgId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, description, unitAmount, active } = z
        .object({ name: z.string(), description: z.string(), unitAmount: z.number(), active: z.boolean() })
        .parse(req.body);

    const product = await stripe.products.create({
        name,
        description,
        active,
        default_price_data: {
            unit_amount: unitAmount,
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

    product.default_price = await stripe.prices.retrieve(product.default_price as string);

    res.status(201).json(product);
};

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userId, orgId } = getAuth(req);

    if (!userId || !orgId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data: products } = await stripe.products.search({ query: `metadata["organizationId"]:"${orgId}"`, limit: 100, expand: ['data.default_price'] });

    res.status(201).json(products);
};

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
