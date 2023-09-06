import { categories, orders, orderLines, media, products } from '@/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const categorySchema = createSelectSchema(categories);
export const newCategorySchema = createInsertSchema(categories);
export type Category = z.infer<typeof categorySchema>;

export const orderSchema = createSelectSchema(orders);
export const newOrderSchema = createInsertSchema(orders);
export type Order = z.infer<typeof orderSchema>;

export const orderLineSchema = createSelectSchema(orderLines);
export const newOrderLineSchema = createInsertSchema(orderLines);
export type OrderLine = z.infer<typeof orderLineSchema>;

export const mediaSchema = createSelectSchema(media);
export const newMediaSchema = createInsertSchema(media);
export type Media = z.infer<typeof mediaSchema>;

export const productSchema = createSelectSchema(products);
export const newProductSchema = createInsertSchema(products);
export type Product = z.infer<typeof productSchema>;

export type OrderStatus = z.infer<typeof orderSchema.shape.status>;
export type MimeType = z.infer<typeof mediaSchema.shape.mimeType>;

export const productWithMediaSchema = z.object({ ...productSchema.shape, src: mediaSchema.shape.src, mimeType: mediaSchema.shape.mimeType });
export type ProductWithMedia = z.infer<typeof productWithMediaSchema>;

export type CartItem = {
    product: ProductWithMedia;
    quantity: number;
};
