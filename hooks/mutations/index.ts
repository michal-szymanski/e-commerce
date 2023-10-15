import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CartItem } from '@/types';
import Stripe from 'stripe';

export const useUpdateCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (cart: CartItem[]) => {
            const payload = JSON.stringify(cart);

            return fetch('/api/carts', {
                method: 'POST',
                body: payload,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        onMutate: async (cart) => {
            await queryClient.cancelQueries({ queryKey: ['order'] });
            const previousCart = queryClient.getQueryData(['order']) as CartItem[];

            const newCart = [...previousCart.filter((pc) => !cart.some((c) => pc.product.id === c.product.id)), ...cart]
                .filter((c) => c.quantity)
                .sort((a, b) => (a.product.id > b.product.id ? 1 : -1));

            queryClient.setQueryData(['order'], () => newCart);

            return { previousCart };
        },
        onError: (err, cart, context) => {
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
        mutationFn: async (data: { name: string; description: string; unitAmount: number; active: boolean }) => {
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
