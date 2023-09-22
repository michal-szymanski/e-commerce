import { useQuery } from '@tanstack/react-query';
import { stripeProductSchema, stripeSearchResultSchema } from '@/types';
import { z } from 'zod';

export const useProducts = (name: string, limit: number, offset: number, enabled: boolean = true) =>
    useQuery({
        queryKey: ['products', { name }],
        queryFn: async () => {
            const response = await (await fetch(`/api/products?name=${name}`)).json();

            return stripeSearchResultSchema.parse(response).data;
        },
        keepPreviousData: false,
        enabled
    });

export const useCart = () =>
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
        }
    });
