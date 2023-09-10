import { DataTable } from '@/components/ui/data-table';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { orderSchema } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getAuth } from '@clerk/nextjs/server';
import { orderLinesTable, ordersTable, productsTable } from '@/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const orderWithTotalPriceSchema = z.object({
    id: z.number(),
    date: z.string(),
    status: orderSchema.shape.status,
    totalPrice: z.string()
});

export default function Page({ orders }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const columns: ColumnDef<z.infer<typeof orderWithTotalPriceSchema>>[] = [
        {
            accessorKey: 'id',
            header: 'Id'
        },
        {
            accessorKey: 'date',
            header: 'Date'
        },
        {
            accessorKey: 'status',
            header: 'Status'
        },
        {
            accessorKey: 'totalPrice',
            header: () => <div className="text-right">Total Price</div>,
            cell: ({ row }) => <div className="text-right font-medium">{row.getValue('totalPrice')}</div>
        }
    ];

    const router = useRouter();

    const data = orders.map((o) => ({ ...o, date: dayjs(o.date).format('DD/MM/YYYY HH:mm') }));

    return (
        <div className="container mx-auto py-10">
            <DataTable
                columns={columns}
                data={data}
                onRowClick={(row) => {
                    router.push(`/orders/${row.getValue('id')}`);
                }}
            />
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<{
    orders: z.infer<typeof orderWithTotalPriceSchema>[];
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

    const orders = await db
        .select({
            id: ordersTable.id,
            date: ordersTable.date,
            status: ordersTable.status,
            totalPrice: sql`SUM(ROUND(${productsTable.price} * ${orderLinesTable.quantity}, 2))`
        })
        .from(ordersTable)
        .where(eq(ordersTable.userId, userId))
        .leftJoin(orderLinesTable, eq(ordersTable.id, orderLinesTable.orderId))
        .leftJoin(productsTable, eq(orderLinesTable.productId, productsTable.id))
        .groupBy(ordersTable.id)
        .orderBy(desc(ordersTable.id));

    await client.end();

    const formattedOrders = z.array(orderWithTotalPriceSchema).parse(orders.map((row) => ({ ...row, date: dayjs(row.date).toISOString() })));

    return { props: { orders: formattedOrders } };
};
