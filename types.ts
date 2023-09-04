import { categories, orders, orderLines, media, products } from '@/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const categorySchema = createSelectSchema(categories);
const newCategorySchema = createInsertSchema(categories);
export type Category = z.infer<typeof categorySchema>;

const orderSchema = createSelectSchema(orders);
const newOrderSchema = createInsertSchema(orders);
export type Order = z.infer<typeof orderSchema>;

const orderLineSchema = createSelectSchema(orderLines);
const newOrderLineSchema = createInsertSchema(orderLines);
export type OrderLine = z.infer<typeof orderLineSchema>;

const mediaSchema = createSelectSchema(media);
const newMediaSchema = createInsertSchema(media);
export type Media = z.infer<typeof mediaSchema>;

const productSchema = createSelectSchema(products);
const newProductSchema = createInsertSchema(products);
export type Product = z.infer<typeof productSchema>;

export type OrderStatus = z.infer<typeof orderSchema.shape.status>;
export type MimeType = z.infer<typeof mediaSchema.shape.mimeType>;
