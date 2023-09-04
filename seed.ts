import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';
import { categories, media, products } from './schema';

loadEnvConfig(process.cwd());

const connectionString = process.env.CONNECTION_STRING;

const seedDatabase = async () => {
    try {
        if (!connectionString) {
            throw new Error('Missing connection string.');
        }

        const client = postgres(connectionString);
        const db = drizzle(client, { logger: true });

        await db.insert(categories).values([
            { id: 1, name: 'Food' },
            { id: 2, name: 'Electronics' }
        ]);

        await db.insert(products).values([
            { id: 1, name: 'Popcorn', description: 'Popcorn description', categoryId: 1, price: '0.99' },
            { id: 2, name: 'TV', description: 'TV description', categoryId: 2, price: '100' }
        ]);

        await db.insert(media).values([
            {
                id: 1,
                src: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
                mimeType: 'image',
                productId: 1
            },
            {
                id: 2,
                src: 'https://images.unsplash.com/photo-1528928441742-b4ccac1bb04c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2564&q=80',
                mimeType: 'image',
                productId: 2
            }
        ]);

        console.log('Done migration.');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedDatabase();
