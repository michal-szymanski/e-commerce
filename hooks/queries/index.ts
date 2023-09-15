import { useQuery } from '@tanstack/react-query';
import { cartItemSchema, productWithMediaSchema } from '@/types';
import { z } from 'zod';

export const useProducts = (search: string, limit: number, offset: number, enabled: boolean = true) =>
    useQuery({
        queryKey: ['products', { search }, { limit }, { offset }],
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

            return z.array(cartItemSchema).parse(response);
        }
    });
