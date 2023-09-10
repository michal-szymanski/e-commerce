import { useMutation } from '@tanstack/react-query';
import { CartItem, cartItemSchema } from '@/types';
import { z } from 'zod';

export const useCreateOrder = (cart: CartItem[]) =>
    useMutation({
        mutationFn: () => {
            const payload = JSON.stringify(z.array(cartItemSchema).parse(cart));

            return fetch('/api/orders', {
                method: 'POST',
                body: payload,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    });
