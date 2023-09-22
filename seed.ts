import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const seedStripe = async () => {
    try {
        console.log('\r\nSeeding.\r\n');

        const testProducts = Array.from({ length: 100 }, (_, k) => ({
            name: `Popcorn ${k + 1}`,
            description: 'Popcorn description',
            images: [
                'https://images.unsplash.com/photo-1578849278619-e73505e9610f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80'
            ],
            default_price_data: {
                currency: 'PLN',
                unit_amount: 99
            }
        }));

        for (let product of testProducts) {
            await stripe.products.create(product);
        }

        console.log('\r\n✅ Done seeding.\r\n');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedStripe();

const connectionString = process.env.CONNECTION_STRING;

// const seedDatabase = async () => {
//     try {
//         if (!connectionString) {
//             throw new Error('Missing connection string.');
//         }
//
//         const client = postgres(connectionString);
//         const db = drizzle(client, { logger: true });
//
//         console.log('\r\nSeeding.\r\n');
//
//         await db
//             .insert(categoriesTable)
//             .values([
//                 { id: 1, name: 'Food' },
//                 { id: 2, name: 'Electronics' }
//             ])
//             .onConflictDoNothing();
//
//         const testProducts = Array.from({ length: 100 }, (_, k) => ({
//             id: k + 1,
//             name: `Popcorn ${k + 1}`,
//             description: 'Popcorn description',
//             categoryId: 1,
//             price: '0.99'
//         }));
//
//         await db.insert(productsTable).values(testProducts).onConflictDoNothing();
//
//         const testMedia = Array.from({ length: 100 }, (_, k) => ({
//             id: k + 1,
//             src: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
//             mimeType: 'image' as MimeType,
//             productId: k + 1
//         }));
//
//         await db.insert(mediaTable).values(testMedia).onConflictDoNothing();
//
//         console.log('\r\n✅ Done seeding.\r\n');
//         process.exit();
//     } catch (e) {
//         console.error(e);
//         process.exit(1);
//     }
// };
