import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CartItem } from '@/types';

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
