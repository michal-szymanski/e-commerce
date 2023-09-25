import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { orderHistoriesTable, orderLinesTable, ordersTable } from '@/schema';
import { eq, ilike, and, isNull, lt, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { alias } from 'drizzle-orm/pg-core';
import { CartItem, orderLineSchema, OrderLineWithProduct, StripePrice, StripeProduct, stripeProductSchema } from '@/types';
import stripe from '@/stripe';

// export const getProducts = async (search: string, limit: number, offset: number) => {
//     const client = postgres(env.CONNECTION_STRING);
//     const db = drizzle(client);
//
//     const products = await db
//         .select({
//             id: productsTable.id,
//             name: productsTable.name,
//             description: productsTable.description,
//             categoryId: productsTable.categoryId,
//             price: productsTable.price,
//             src: mediaTable.src,
//             mimeType: mediaTable.mimeType
//         })
//         .from(productsTable)
//         .where(ilike(productsTable.name, `%${search}%`))
//         .orderBy(productsTable.name)
//         .limit(limit)
//         .offset(offset)
//         .leftJoin(mediaTable, eq(productsTable.id, mediaTable.productId));
//
//     await client.end();
//
//     return z.array(productWithMediaSchema).parse(products);
// };

// export const getProduct = async (id: number) => {
//     const client = postgres(env.CONNECTION_STRING);
//     const db = drizzle(client);
//
//     const products = await db
//         .select({
//             id: productsTable.id,
//             name: productsTable.name,
//             description: productsTable.description,
//             categoryId: productsTable.categoryId,
//             price: productsTable.price,
//             src: mediaTable.src,
//             mimeType: mediaTable.mimeType
//         })
//         .from(productsTable)
//         .where(eq(productsTable.id, id))
//         .leftJoin(mediaTable, eq(productsTable.id, mediaTable.productId));
//
//     await client.end();
//
//     return z.array(productWithMediaSchema).length(1).parse(products)[0];
// };

export const getCartOrders = async (db: PostgresJsDatabase, userId: string) => {
    const h1 = alias(orderHistoriesTable, 'h1');
    const h2 = alias(orderHistoriesTable, 'h2');

    return await db
        .select({
            id: ordersTable.id,
            userId: ordersTable.userId,
            checkoutSessionId: ordersTable.checkoutSessionId
        })
        .from(ordersTable)
        .leftJoin(h1, eq(ordersTable.id, h1.orderId))
        .leftJoin(h2, and(eq(ordersTable.id, h2.orderId), or(lt(h1.date, h2.date), and(eq(h1.date, h2.date), lt(h1.id, h2.id)))))
        .where(and(eq(ordersTable.userId, userId), eq(h1.status, 'New'), isNull(h2.id)));
};

export const getOrderLinesWithProducts = async (db: PostgresJsDatabase, orderId: number) => {
    const cartItems: OrderLineWithProduct[] = [];

    const orderLines = await db.select().from(orderLinesTable).where(eq(orderLinesTable.orderId, orderId));

    const parsedOrderLines = z.array(orderLineSchema).parse(orderLines);

    for (let ol of parsedOrderLines) {
        const product = stripeProductSchema.parse(
            await stripe.products.retrieve(ol.productId, {
                expand: ['default_price']
            })
        );
        const price = product.default_price as StripePrice;

        cartItems.push({
            productId: product.id,
            productName: product.name,
            productPrice: price.unit_amount,
            quantity: Number(ol.quantity),
            totalPrice: Number(ol.quantity) * price.unit_amount
        });
    }

    return cartItems;
};
