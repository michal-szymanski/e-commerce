import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { clerkClient } from '@clerk/nextjs/server';
import { organizations as organizationsAPI } from '@clerk/nextjs/api';

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

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const { organizationIds } = z
        .object({
            organizationIds: z.union([z.array(z.string()), z.string()]).transform((value) => (Array.isArray(value) ? [...new Set(value)] : [value]))
        })
        .parse(req.query);

    const organizations: { id: string; name: string }[] = [];

    for (let id of organizationIds) {
        const { name } = await organizationsAPI.getOrganization({ organizationId: id });
        organizations.push({ id, name });
    }

    res.status(200).json(organizations);
}

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
