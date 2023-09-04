import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { productSchema, mediaSchema } from '@/types';

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
            const schema = z.array(z.object({ ...productSchema.shape, src: mediaSchema.shape.src, mimeType: mediaSchema.shape.mimeType }));
            //return response;
            return schema.parse(response);
        },
        keepPreviousData: true
    });
