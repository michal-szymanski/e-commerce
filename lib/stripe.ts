import Stripe from 'stripe';
import { env } from '@/env.mjs';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-08-16'
});

export default stripe;
