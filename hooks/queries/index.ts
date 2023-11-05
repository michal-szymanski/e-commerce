import { useQuery } from '@tanstack/react-query';
import { CartItem, cartItemSchema, categorySchema, searchProductSchema } from '@/types';
import { z } from 'zod';
import Stripe from 'stripe';
import { getCartFromLocalStorage } from '@/services/local-storage-service';

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

export const useCart = (enabled: boolean, isSignedIn: boolean) =>
    useQuery({
        queryKey: ['order'],
        queryFn: async () => {
            const response = isSignedIn
                ? await (
                      await fetch('/api/carts', {
                          method: 'GET',
                          headers: {
                              'Content-Type': 'application/json'
                          }
                      })
                  ).json()
                : getCartFromLocalStorage();

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

            return (response as Stripe.Product[]).sort((a, b) => b.created - a.created);
        },
        enabled
    });

export const useCategories = () =>
    useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await (
                await fetch('/api/categories', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ).json();

            return z.array(categorySchema).parse(response);
        }
    });

export const useCartOrganizations = (cart?: CartItem[]) =>
    useQuery({
        queryKey: ['cart-organizations'],
        queryFn: async () => {
            const uniqueOrganizationIds = [...new Set(cart?.map((c) => c.product.organizationId) ?? [])];
            const response = await (
                await fetch(`/api/organizations?organizationIds=${uniqueOrganizationIds.join('&organizationIds=')}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ).json();

            return z
                .array(
                    z.object({
                        id: z.string(),
                        name: z.string()
                    })
                )
                .parse(response);
        },
        enabled: !!cart?.length
    });
