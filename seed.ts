import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';
import { categories, media, products } from './schema';
import { MimeType } from '@/types';

loadEnvConfig(process.cwd());

const connectionString = process.env.CONNECTION_STRING;

const seedDatabase = async () => {
    try {
        if (!connectionString) {
            throw new Error('Missing connection string.');
        }

        const client = postgres(connectionString);
        const db = drizzle(client, { logger: true });

        console.log('\r\nSeeding.\r\n');

        await db
            .insert(categories)
            .values([
                { id: 1, name: 'Food' },
                { id: 2, name: 'Electronics' }
            ])
            .onConflictDoNothing();

        const testProducts = Array.from({ length: 100 }, (_, k) => ({
            id: k + 1,
            name: `Popcorn ${k + 1}`,
            description: 'Popcorn description',
            categoryId: 1,
            price: '0.99'
        }));

        await db.insert(products).values(testProducts).onConflictDoNothing();

        const testMedia = Array.from({ length: 100 }, (_, k) => ({
            id: k + 1,
            src: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
            mimeType: 'image' as MimeType,
            productId: k + 1
        }));

        await db.insert(media).values(testMedia).onConflictDoNothing();

        console.log('\r\n✅ Done seeding.\r\n');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedDatabase();
