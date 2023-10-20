import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

export const getTotalPrice = (price: number, quantity: number) => ((price * quantity) / 100).toFixed(2);

export const getProductPageParams = (id: string, name: string) => ({ id, name: name.replace(/\s/g, '-') });

export const getProductPageUrl = (id: string, name: string) => {
    const params = getProductPageParams(id, name);
    return `/products/${params.id}/${params.name}`;
};
