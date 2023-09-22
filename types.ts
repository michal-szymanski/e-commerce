import { categoriesTable, ordersTable, orderLinesTable, orderHistoriesTable } from '@/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const categorySchema = createSelectSchema(categoriesTable);
export const newCategorySchema = createInsertSchema(categoriesTable);
export type Category = z.infer<typeof categorySchema>;

export const orderSchema = createSelectSchema(ordersTable);
export const newOrderSchema = createInsertSchema(ordersTable);
export type Order = z.infer<typeof orderSchema>;

export const orderLineSchema = createSelectSchema(orderLinesTable);
export const newOrderLineSchema = createInsertSchema(orderLinesTable);
export type OrderLine = z.infer<typeof orderLineSchema>;

export const orderHistorySchema = createSelectSchema(orderHistoriesTable);
export type OrderHistory = z.infer<typeof orderHistorySchema>;

export const orderStatusSchema = orderHistorySchema.shape.status;
export type OrderStatus = z.infer<typeof orderStatusSchema>;

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

export type StripePrice = z.infer<typeof stripePriceSchema>;

export const stripeProductSchema = z.object({
    id: z.string(),
    object: z.literal('product'),
    active: z.boolean(),
    created: z.number(),
    default_price: z.union([stripePriceSchema, z.string()]),
    description: z.string(),
    features: z.array(z.any()),
    images: z.array(z.string()),
    livemode: z.boolean(),
    metadata: z.object({}),
    name: z.string(),
    package_dimensions: z.null(),
    shippable: z.null(),
    statement_descriptor: z.null(),
    tax_code: z.null(),
    unit_label: z.null(),
    updated: z.number(),
    url: z.null()
});

export type StripeProduct = z.infer<typeof stripeProductSchema>;
export const stripeSearchResultSchema = z.object({
    object: z.literal('search_result'),
    data: z.array(stripeProductSchema),
    has_more: z.boolean(),
    next_page: z.string().nullable(),
    url: z.literal('/v1/products/search')
});

export type StripeProductSearchResult = z.infer<typeof stripeSearchResultSchema>;

export const cartItemSchema = z.object({
    product: stripeProductSchema,
    quantity: z.number()
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const orderLineWithProductSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    productPrice: z.number(),
    quantity: z.number(),
    totalPrice: z.number()
});

export type OrderLineWithProduct = z.infer<typeof orderLineWithProductSchema>;
