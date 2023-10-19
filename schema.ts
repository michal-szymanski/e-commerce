import { bigint, boolean, integer, numeric, pgEnum, pgTable, serial, smallint, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categoriesTable = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: text('name').notNull()
});

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
    products: many(productsTable)
}));

export const ordersTable = pgTable('orders', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    organizationId: text('organization_id').notNull(),
    checkoutSessionId: text('checkout_session_id')
});

export const ordersRelations = relations(ordersTable, ({ many }) => ({
    orderHistories: many(orderHistoriesTable)
}));

export const cartItemsTable = pgTable('cart_items', {
    id: serial('id').primaryKey(),
    productId: text('product_id')
        .notNull()
        .references(() => productsTable.id),
    quantity: numeric('quantity', { precision: 11, scale: 3 }).notNull(),
    userId: text('user_id').notNull()
});

export const cartItemsRelations = relations(cartItemsTable, ({ one }) => ({
    product: one(productsTable, {
        fields: [cartItemsTable.productId],
        references: [productsTable.id]
    })
}));

export const orderStatusEnum = pgEnum('order_status', ['Pending', 'New', 'In Progress', 'Completed', 'Cancelled']);

export const orderHistoriesTable = pgTable('order_histories', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
        .notNull()
        .references(() => ordersTable.id),
    status: orderStatusEnum('order_status').notNull(),
    date: timestamp('date', { mode: 'string', withTimezone: true }).notNull()
});

export const orderHistoriesRelations = relations(orderHistoriesTable, ({ one }) => ({
    order: one(ordersTable, {
        fields: [orderHistoriesTable.orderId],
        references: [ordersTable.id]
    })
}));

export const productsTable = pgTable('products', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    active: boolean('active').notNull(),
    priceId: text('price_id')
        .notNull()
        .references(() => pricesTable.id),
    organizationId: text('organizationId').notNull(),
    categoryId: integer('categoryId')
        .notNull()
        .references(() => categoriesTable.id)
});

export const productsRelations = relations(productsTable, ({ one, many }) => ({
    category: one(categoriesTable, {
        fields: [productsTable.categoryId],
        references: [categoriesTable.id]
    }),
    price: one(pricesTable, {
        fields: [productsTable.priceId],
        references: [pricesTable.id]
    }),
    images: many(imagesTable),
    cartItems: many(cartItemsTable)
}));

export const pricesTable = pgTable('prices', {
    id: text('id').primaryKey(),
    unitAmount: bigint('unit_amount', { mode: 'number' }).notNull(),
    currency: text('currency').notNull(),
    active: boolean('active').notNull()
});

export const pricesRelations = relations(pricesTable, ({ one }) => ({
    product: one(productsTable)
}));

export const imagesTable = pgTable('images', {
    id: serial('id').primaryKey(),
    productId: text('product_id')
        .notNull()
        .references(() => productsTable.id),
    sequence: smallint('sequence').notNull(),
    src: text('src').notNull()
});

export const imagesRelations = relations(imagesTable, ({ one }) => ({
    product: one(productsTable, {
        fields: [imagesTable.productId],
        references: [productsTable.id]
    })
}));
