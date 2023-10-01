import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { clerkClient } from '@clerk/nextjs/server';

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const { userId, organizationName } = z
        .object({
            userId: z.string(),
            organizationName: z.string()
        })
        .parse(req.body);

    const user = await clerkClient.users.getUser(userId);

    if (!user) {
        return res.status(422).end();
    }

    const organization = await clerkClient.organizations.createOrganization({ name: organizationName, createdBy: user.id });
    res.status(201).json({ organizationId: organization.id });
}

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
