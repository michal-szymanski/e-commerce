import { integer, numeric, pgTable, serial, pgEnum, date, primaryKey, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: text('name').notNull()
});

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products)
}));

export const mimeTypeEnum = pgEnum('mime_type', ['image', 'video']);

export const media = pgTable('media', {
    id: serial('id').primaryKey(),
    src: text('src').notNull(),
    mimeType: mimeTypeEnum('mime_type').notNull(),
    productId: integer('product_id')
        .references(() => products.id)
        .notNull()
});

export const mediaRelations = relations(media, ({ one }) => ({
    product: one(products, {
        fields: [media.productId],
        references: [products.id]
    })
}));

export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    categoryId: integer('category_id')
        .references(() => categories.id)
        .notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull()
});

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id]
    }),
    media: many(media),
    orders: many(orders)
}));

export const orderStatusEnum = pgEnum('order_status', ['New', 'In Progress', 'Completed', 'Cancelled']);

export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    date: date('date', { mode: 'string' }).notNull(),
    status: orderStatusEnum('order_status').notNull(),
    userId: text('user_id').notNull()
});

export const ordersRelations = relations(orders, ({ many }) => ({
    products: many(products)
}));

export const orderLines = pgTable(
    'order_lines',
    {
        orderId: integer('order_id')
            .notNull()
            .references(() => orders.id),
        productId: integer('product_id')
            .notNull()
            .references(() => products.id),
        quantity: numeric('quantity', { precision: 11, scale: 3 }).notNull()
    },
    (t) => ({
        pk: primaryKey(t.orderId, t.productId)
    })
);

export const orderLinesRelations = relations(orderLines, ({ one }) => ({
    order: one(orders, {
        fields: [orderLines.orderId],
        references: [orders.id]
    }),
    product: one(products, {
        fields: [orderLines.productId],
        references: [products.id]
    })
}));
