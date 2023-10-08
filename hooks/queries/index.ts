import { useQuery } from '@tanstack/react-query';
import { stripeProductSchema } from '@/types';
import { z } from 'zod';

export const useProducts = ({ name, enabled }: { name: string; enabled: boolean }) =>
    useQuery({
        queryKey: ['products', { name }],
        queryFn: async () => {
            const response = await (await fetch(`/api/products?name=${name}`)).json();

            return z.array(stripeProductSchema).parse(response);
        },
        keepPreviousData: false,
        enabled
    });

export const useCart = (enabled: boolean) =>
    useQuery({
        queryKey: ['order'],
        queryFn: async () => {
            const response = await (
                await fetch('/api/carts', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ).json();

            return z.array(z.object({ product: stripeProductSchema, quantity: z.number() })).parse(response);
        },
        enabled
    });
