import { DataTable } from '@/components/ui/data-table';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { orderHistorySchema } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getAuth } from '@clerk/nextjs/server';
import { orderHistoriesTable, ordersTable } from '@/schema';
import { and, desc, eq, not, sql } from 'drizzle-orm';
import { z } from 'zod';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import OrderStatusBadge from '@/components/ui/custom/order-status-badge';
import stripe from '@/stripe';

const orderWithTotalPriceSchema = z.object({
    id: z.number(),
    date: z.string(),
    status: orderHistorySchema.shape.status,
    totalPrice: z.string(),
    checkoutSessionId: z.string()
});

export default function Page({ orders }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();

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
            header: 'Status',
            cell: ({ row }) => <OrderStatusBadge status={row.getValue('status')} />
        },
        {
            accessorKey: 'totalPrice',
            header: () => <div className="text-right">Total Price</div>,
            cell: ({ row }) => <div className="text-right font-medium">{row.getValue('totalPrice')}</div>
        },
        {
            accessorKey: 'actions',
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => (
                <div className="text-center">
                    <Button
                        variant="link"
                        onClick={async () => {
                            await router.push(`/orders/${row.getValue('id')}`);
                        }}
                    >
                        Details
                    </Button>
                </div>
            )
        }
    ];

    const data = orders.map((o) => ({ ...o, date: dayjs(o.date).format('DD/MM/YYYY HH:mm') }));

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
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
            date: sql`min(${orderHistoriesTable.date})`,
            status: sql`max(${orderHistoriesTable.status})`,
            checkoutSessionId: ordersTable.checkoutSessionId
        })
        .from(ordersTable)
        .leftJoin(orderHistoriesTable, eq(orderHistoriesTable.orderId, ordersTable.id))
        .where(and(eq(ordersTable.userId, userId), not(eq(orderHistoriesTable.status, 'New'))))
        .groupBy(ordersTable.id)
        .orderBy(desc(ordersTable.id));

    const ordersWithTotals = orders.map(async (o) => {
        const session = await stripe.checkout.sessions.retrieve(o.checkoutSessionId, {
            expand: ['line_items']
        });

        return {
            ...o,
            date: dayjs(o.date as string).toISOString(),
            checkoutSessionId: session.id,
            totalPrice: session.line_items.data.reduce((acc, curr) => acc + curr.amount_total / 100, 0).toFixed(2)
        };
    });

    await client.end();

    const parsedOrdersWithTotals = z.array(orderWithTotalPriceSchema).parse(await Promise.all(ordersWithTotals));

    return { props: { orders: parsedOrdersWithTotals } };
};
