import { categoriesTable, ordersTable, orderLinesTable, mediaTable, productsTable } from '@/schema';
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

export const mediaSchema = createSelectSchema(mediaTable);
export const newMediaSchema = createInsertSchema(mediaTable);
export type Media = z.infer<typeof mediaSchema>;

export const productSchema = createSelectSchema(productsTable);
export const newProductSchema = createInsertSchema(productsTable);
export type Product = z.infer<typeof productSchema>;

export type OrderStatus = z.infer<typeof orderSchema.shape.status>;
export type MimeType = z.infer<typeof mediaSchema.shape.mimeType>;

export const productWithMediaSchema = z.object({ ...productSchema.shape, src: mediaSchema.shape.src, mimeType: mediaSchema.shape.mimeType });
export type ProductWithMedia = z.infer<typeof productWithMediaSchema>;

export const cartItemSchema = z.object({
    product: productWithMediaSchema,
    quantity: z.number().min(1)
});

export type CartItem = z.infer<typeof cartItemSchema>;
