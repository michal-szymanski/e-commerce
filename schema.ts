import { integer, numeric, pgTable, serial, pgEnum, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categoriesTable = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: text('name').notNull()
});

export const ordersTable = pgTable('orders', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull()
});

export const ordersRelations = relations(ordersTable, ({ many }) => ({
    orderHistories: many(orderHistoriesTable)
}));

export const orderLinesTable = pgTable(
    'order_lines',
    {
        orderId: integer('order_id')
            .notNull()
            .references(() => ordersTable.id),
        productId: text('product_id').notNull(),
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
    })
}));

export const orderStatusEnum = pgEnum('order_status', ['New', 'Pending', 'In Progress', 'Completed', 'Cancelled']);

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
