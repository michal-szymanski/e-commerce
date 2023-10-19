import { z } from 'zod';

export const idSchema = z.number().min(1);

export const orderSchema = z.object({
    id: idSchema,
    userId: z.string(),
    organizationId: z.string(),
    checkoutSessionId: z.string().optional()
});

export const orderStatusSchema = z.enum(['Pending', 'New', 'In Progress', 'Completed', 'Cancelled']);

export const orderHistorySchema = z.object({
    id: idSchema,
    orderId: idSchema,
    status: orderStatusSchema,
    date: z.string()
});

export const stripePriceSchema = z.object({
    id: z.string(),
    object: z.string(),
    active: z.boolean(),
    billing_scheme: z.string(),
    created: z.number(),
    currency: z.string(),
    custom_unit_amount: z.null(),
    livemode: z.boolean(),
    lookup_key: z.null(),
    metadata: z.object({}),
    nickname: z.null(),
    product: z.string(),
    recurring: z.null(),
    tax_behavior: z.string(),
    tiers_mode: z.null(),
    transform_quantity: z.null(),
    type: z.string(),
    unit_amount: z.number(),
    unit_amount_decimal: z.string()
});

export const stripeProductSchema = z.object({
    id: z.string(),
    object: z.literal('product'),
    active: z.boolean(),
    created: z.number(),
    default_price: stripePriceSchema,
    description: z.string(),
    features: z.array(z.any()),
    images: z.array(z.string()),
    livemode: z.boolean(),
    metadata: z.object({
        organizationId: z.string(),
        categoryId: z.string()
    }),
    name: z.string(),
    package_dimensions: z.null(),
    shippable: z.null(),
    statement_descriptor: z.null(),
    tax_code: z.null(),
    unit_label: z.null(),
    updated: z.number(),
    url: z.null()
});

export const productSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    unitAmount: z.number(),
    currency: z.string(),
    images: z.array(z.string()),
    organizationId: z.string(),
    priceId: z.string()
});

export const cartItemSchema = z.object({
    product: productSchema,
    quantity: z.number()
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const searchProductSchema = z.object({
    id: z.string(),
    name: z.string()
});
