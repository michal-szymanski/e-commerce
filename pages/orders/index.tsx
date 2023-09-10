import { DataTable } from '@/components/ui/data-table';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Order, orderSchema } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getAuth } from '@clerk/nextjs/server';
import { orders } from '@/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import dayjs from 'dayjs';
export default function Page({ orders }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'status',
            header: 'Status'
        },
        {
            accessorKey: 'date',
            header: 'Date'
        }
    ];

    const data = orders.map((o) => ({ ...o, date: dayjs(o.date).format('DD.MM.YYYY') }));

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<{
    orders: Order[];
}> = async (context) => {
    const { userId } = getAuth(context.req);

    if (!userId) {
        return {
            redirect: {
                destination: '/sign-in',
                permanent: false
            }
        };
    }

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);

    const result = await db.select().from(orders).where(eq(orders.userId, userId));
    await client.end();

    const data = z.array(orderSchema).parse(result.map((row) => ({ ...row, date: new Date(row.date).toISOString() })));
    return { props: { orders: data } };
};
