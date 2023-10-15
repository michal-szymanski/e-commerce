import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { cartItemsTable, imagesTable, pricesTable, productsTable } from '@/schema';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { CartItem, cartItemSchema } from '@/types';

export const getCartItems = async (db: PostgresJsDatabase, userId: string) => {
    const productsWithQuantities = await db
        .select({
            product: {
                id: productsTable.id,
                name: productsTable.name,
                description: productsTable.description,
                unitAmount: pricesTable.unitAmount,
                currency: pricesTable.currency,
                organizationId: productsTable.organizationId,
                priceId: productsTable.priceId
            },
            quantity: cartItemsTable.quantity
        })
        .from(cartItemsTable)
        .innerJoin(productsTable, eq(productsTable.id, cartItemsTable.productId))
        .innerJoin(pricesTable, eq(pricesTable.id, productsTable.priceId))
        .innerJoin(imagesTable, eq(imagesTable.productId, productsTable.id))
        .where(eq(cartItemsTable.userId, userId))
        .orderBy(cartItemsTable.productId);

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
