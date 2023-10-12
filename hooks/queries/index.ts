import { useQuery } from '@tanstack/react-query';
import { cartItemSchema, searchProductSchema } from '@/types';
import { z } from 'zod';
import Stripe from 'stripe';

export const useSearchProducts = ({ name, enabled }: { name: string; enabled: boolean }) =>
    useQuery({
        queryKey: ['products', { name }],
        queryFn: async () => {
            const response = await (await fetch(`/api/products?name=${name}`)).json();

            return z.array(searchProductSchema).parse(response);
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

            return z.array(cartItemSchema).parse(response);
        },
        enabled
    });

export const useOrganizationProducts = ({ enabled }: { enabled: boolean }) =>
    useQuery({
        queryKey: ['organization-products'],
        queryFn: async () => {
            const response = await (
                await fetch('/api/stripe/products', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ).json();

            return response as Stripe.Product[];
        },
        enabled
    });
