import { env } from '@/env.mjs';
import { CartItem } from '@/types';

const key = `${env.NEXT_PUBLIC_APP_NAME.toUpperCase()}_CART`;

export const saveCartToLocalStorage = (cart: CartItem[]) => localStorage.setItem(key, JSON.stringify(cart));
export const getCartFromLocalStorage = () => JSON.parse(localStorage.getItem(key) ?? '[]') as CartItem[];
