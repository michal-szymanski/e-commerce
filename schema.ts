import { integer, numeric, pgTable, serial, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 })
});

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products)
}));

export const mimeTypeEnum = pgEnum('mimeType', ['image', 'video']);

export const media = pgTable('media', {
    id: serial('id').primaryKey(),
    src: varchar('src', { length: 255 }),
    mimeType: mimeTypeEnum('mimeType'),
    productId: integer('productId').references(() => products.id)
});

export const mediaRelations = relations(media, ({ one }) => ({
    product: one(products, {
        fields: [media.productId],
        references: [products.id]
    })
}));

export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }),
    description: varchar('name', { length: 255 }),
    categoryId: integer('categoryId').references(() => categories.id),
    price: numeric('price', { precision: 10, scale: 2 })
});

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id]
    }),
    media: many(media)
}));
