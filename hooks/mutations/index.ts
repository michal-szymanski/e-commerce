import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CartItem } from '@/types';
import Stripe from 'stripe';
import { saveCartToLocalStorage } from '@/services/local-storage-service';
import { z } from 'zod';

export const useUpdateCart = ({ isSignedIn }: { isSignedIn: boolean }) => {
    const queryClient = useQueryClient();
    const mergeCart = (cart: CartItem[]) => {
        const previousCart = (queryClient.getQueryData(['order']) ?? []) as CartItem[];

        const newCart = [...previousCart.filter((pc) => !cart.some((c) => pc.product.id === c.product.id)), ...cart]
            .filter((c) => c.quantity)
            .sort((a, b) => (a.product.id > b.product.id ? 1 : -1));

        return { newCart, previousCart };
    };

    return useMutation({
        mutationFn: (cart: CartItem[]) => {
            const payload = JSON.stringify(cart);
            if (isSignedIn) {
                return fetch('/api/carts', {
                    method: 'POST',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            return new Promise((resolve, reject) => {
                try {
                    const { newCart } = mergeCart(cart);
                    saveCartToLocalStorage(newCart);
                    resolve(newCart);
                } catch (error) {
                    reject(error);
                }
            });
        },
        onMutate: async (cart) => {
            await queryClient.cancelQueries({ queryKey: ['order'] });
            const { newCart, previousCart } = mergeCart(cart);
            queryClient.setQueryData(['order'], () => newCart);

            return { previousCart };
        },
        onError: (_err, _cart, context) => {
            queryClient.setQueryData(['order'], context?.previousCart);
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ['order'] });
        }
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; description: string; unitAmount: number; active: boolean; categoryId: number }) => {
            const payload = JSON.stringify(data);

            const response = await (
                await fetch('/api/stripe/products', {
                    method: 'POST',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ).json();

            return response as Stripe.Product;
        },
        onSuccess: (product) => {
            queryClient.setQueryData<Stripe.Product[]>(['organization-products'], (organizationProducts) => [product, ...(organizationProducts ?? [])]);
        }
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            productId,
            ...rest
        }: {
            productId: string;
            priceId?: string;
            name?: string;
            description?: string;
            unitAmount?: number;
            active?: boolean;
            categoryId?: number;
        }) => {
            const payload = JSON.stringify(rest);

            const response = await (
                await fetch(`/api/stripe/products/${productId}`, {
                    method: 'PATCH',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ).json();

            return response as Stripe.Product;
        },
        onSuccess: (product) => {
            queryClient.setQueryData<Stripe.Product[]>(['organization-products'], (organizationProducts) =>
                !organizationProducts
                    ? [product]
                    : organizationProducts.map((p) => {
                          if (p.id === product.id) {
                              return product;
                          }

                          return p;
                      })
            );
        }
    });
};

export const useCreateCheckoutSession = () =>
    useMutation({
        mutationFn: async (cart: CartItem[]) => {
            const payload = JSON.stringify(cart);

            const response = await (
                await fetch(`/api/stripe/checkout-session`, {
                    method: 'POST',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ).json();

            return z.object({ sessionUrl: z.string() }).parse(response);
        }
    });
