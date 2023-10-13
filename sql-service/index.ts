import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { imagesTable, orderHistoriesTable, orderLinesTable, ordersTable, pricesTable, productsTable } from '@/schema';
import { and, eq, inArray, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod';
import { alias } from 'drizzle-orm/pg-core';
import { CartItem, cartItemSchema, orderLineSchema, OrderLineWithProduct, stripeProductSchema } from '@/types';
import stripe from '@/lib/stripe';

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

export const getCartItems = async (db: PostgresJsDatabase, orderId: number) => {
    const productsWithQuantities = await db
        .select({
            product: {
                id: productsTable.id,
                name: productsTable.name,
                description: productsTable.description,
                unitAmount: pricesTable.unitAmount,
                currency: pricesTable.currency
            },
            quantity: orderLinesTable.quantity
        })
        .from(orderLinesTable)
        .innerJoin(productsTable, eq(productsTable.id, orderLinesTable.productId))
        .innerJoin(pricesTable, eq(pricesTable.id, productsTable.priceId))
        .innerJoin(imagesTable, eq(imagesTable.productId, productsTable.id))
        .where(eq(orderLinesTable.orderId, orderId))
        .orderBy(orderLinesTable.productId);

    let cartItems: CartItem[] = [];

    if (productsWithQuantities.length) {
        const ids = productsWithQuantities.map((p) => p.product.id);

        const images = await db.select().from(imagesTable).where(inArray(imagesTable.productId, ids));

        cartItems = productsWithQuantities.map(({ quantity, product }) => ({
            product: {
                ...product,
                images: images
                    .filter((i) => product.id === i.productId)
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((img) => img.src)
            },
            quantity: Number(quantity)
        }));
    }

    return z.array(cartItemSchema).parse(cartItems);
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
        const price = product.default_price.unit_amount;

        cartItems.push({
            productId: product.id,
            productName: product.name,
            productPrice: price,
            quantity: Number(ol.quantity),
            totalPrice: Number(ol.quantity) * price
        });
    }

    return cartItems;
};
