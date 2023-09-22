import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StripePrice, StripeProduct } from '@/types';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getRandomValue = (min: number, max: number) => Math.floor(Math.random() * max) + min;

export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(func: F, waitFor: number): (...args: Parameters<F>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

export const getTotalPrice = (product: StripeProduct, quantity: number) =>
    (z.coerce.number().parse((product.default_price as StripePrice).unit_amount * quantity) / 100).toFixed(2);

export const getProductUrl = (id: string, name: string) => `/products/${id}/${name.replace(/\s/g, '-')}`;
