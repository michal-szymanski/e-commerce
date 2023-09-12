import { useQuery } from '@tanstack/react-query';
import { productWithMediaSchema } from '@/types';
import { z } from 'zod';

export const useProducts = (search: string, limit: number, offset: number) =>
    useQuery({
        queryKey: ['products', search, limit, offset],
        queryFn: async () => {
            const response = await (
                await fetch(`/api/products?search=${search}&limit=${limit}&offset=${offset}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ).json();

            return z.array(productWithMediaSchema).parse(response);
        },
        keepPreviousData: true
    });

export const useSearchProducts = (value: string) =>
    useQuery({
        queryKey: ['search-products', value],
        queryFn: async () => {
            const response = await (
                await fetch(`/api/products?search=${value}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ).json();

            const searchSchema = z.object({
                id: z.number(),
                name: z.string()
            });

            return z.array(searchSchema).parse(response);
        },
        keepPreviousData: true,
        enabled: !!value
    });
