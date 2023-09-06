import { useQuery } from '@tanstack/react-query';
import { productWithMediaSchema } from '@/types';
import { z } from 'zod';

export const useProducts = (limit: number, offset: number) =>
    useQuery({
        queryKey: ['products', limit, offset],
        queryFn: async () => {
            const response = await (
                await fetch(`/api/products?limit=${limit}&offset=${offset}`, {
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
