import { integer, numeric, pgTable, serial, pgEnum, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categoriesTable = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: text('name').notNull()
});

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
    products: many(productsTable)
}));

export const mimeTypeEnum = pgEnum('mime_type', ['image', 'video']);

export const mediaTable = pgTable('media', {
    id: serial('id').primaryKey(),
    src: text('src').notNull(),
    mimeType: mimeTypeEnum('mime_type').notNull(),
    productId: integer('product_id')
        .references(() => productsTable.id)
        .notNull()
});

export const mediaRelations = relations(mediaTable, ({ one }) => ({
    product: one(productsTable, {
        fields: [mediaTable.productId],
        references: [productsTable.id]
    })
}));

export const productsTable = pgTable('products', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    categoryId: integer('category_id')
        .references(() => categoriesTable.id)
        .notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull()
});

export const productsRelations = relations(productsTable, ({ one, many }) => ({
    category: one(categoriesTable, {
        fields: [productsTable.categoryId],
        references: [categoriesTable.id]
    }),
    media: many(mediaTable),
    orders: many(ordersTable)
}));

export const orderStatusEnum = pgEnum('order_status', ['New', 'In Progress', 'Completed', 'Cancelled']);

export const ordersTable = pgTable('orders', {
    id: serial('id').primaryKey(),
    date: timestamp('date', { mode: 'string', withTimezone: true }).notNull(),
    status: orderStatusEnum('order_status').notNull(),
    userId: text('user_id').notNull()
});

export const ordersRelations = relations(ordersTable, ({ many }) => ({
    products: many(productsTable)
}));

export const orderLinesTable = pgTable(
    'order_lines',
    {
        orderId: integer('order_id')
            .notNull()
            .references(() => ordersTable.id),
        productId: integer('product_id')
            .notNull()
            .references(() => productsTable.id),
        quantity: numeric('quantity', { precision: 11, scale: 3 }).notNull()
    },
    (t) => ({
        pk: primaryKey(t.orderId, t.productId)
    })
);

export const orderLinesRelations = relations(orderLinesTable, ({ one }) => ({
    order: one(ordersTable, {
        fields: [orderLinesTable.orderId],
        references: [ordersTable.id]
    }),
    product: one(productsTable, {
        fields: [orderLinesTable.productId],
        references: [productsTable.id]
    })
}));
