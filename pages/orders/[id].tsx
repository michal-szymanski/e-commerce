import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { getAuth } from '@clerk/nextjs/server';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { orderHistoriesTable, ordersTable } from '@/schema';
import { and, eq, sql, inArray, not, desc } from 'drizzle-orm';
import { OrderStatus, orderStatusSchema, stripeOrderLineSchema, StripeOrderLine } from '@/types';
import dayjs from 'dayjs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusBadge from '@/components/ui/custom/order-status-badge';
import Link from 'next/link';
import { getProductUrl } from '@/lib/utils';
import stripe from '@/stripe';
import { alias } from 'drizzle-orm/pg-core';
import Head from 'next/head';

export default function Page({ order, orderLines }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const columns: ColumnDef<StripeOrderLine>[] = [
        {
            id: 'price.product',
            accessorKey: 'price.product'
        },
        {
            accessorKey: 'description',
            header: 'Name'
        },
        {
            id: 'price.unit_amount',
            accessorKey: 'price.unit_amount',
            header: () => <div className="text-right">Unit Price</div>,
            cell: ({ row }) => <div className="text-right">{(row.getValue('price.unit_amount') as number) / 100}</div>
        },
        {
            accessorKey: 'quantity',
            header: () => <div className="text-right">Quantity</div>,
            cell: ({ row }) => <div className="text-right">{z.coerce.number().parse(row.getValue('quantity'))}</div>
        },
        {
            id: 'amount_total',
            accessorKey: 'amount_total',
            header: () => <div className="text-right">Total Price</div>,
            cell: ({ row }) => <div className="text-right font-medium">{(row.getValue('amount_total') as number) / 100}</div>
        },
        {
            accessorKey: 'actions',
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => (
                <div className="text-center">
                    <Link href={getProductUrl(row.getValue('price.product'), row.getValue('description'))}>
                        <Button variant="link">Product Page</Button>
                    </Link>
                </div>
            )
        }
    ];

    const formattedOrder = { ...order, date: dayjs(order.date as string).format('DD/MM/YYYY HH:mm') };
    const totalPrice = orderLines.reduce((acc, curr) => acc + curr.amount_total, 0) / 100;

    return (
        <>
            <Head>
                <title>{`Order | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container mx-auto py-10">
                <header className="mb-10 grid grid-cols-[300px_300px] gap-10">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order {formattedOrder.id}</CardTitle>
                            <CardDescription>{formattedOrder.date}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg">
                                Total Price: <span className="font-semibold">{totalPrice}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <OrderStatusBadge status={formattedOrder.status} />
                        </CardFooter>
                    </Card>
                </header>
                <DataTable columns={columns} data={orderLines} hiddenColumns={['price.product']} />
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps<{
    order: { id: number; date: string; status: OrderStatus };
    orderLines: StripeOrderLine[];
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

    const orderId = z.coerce.number().parse(context.query.id);

    const excludedStatuses: OrderStatus[] = ['New'];

    const firstHistory = alias(orderHistoriesTable, 'oh1');
    const lastHistory = alias(orderHistoriesTable, 'oh2');

    const orders = await db
        .select({
            id: ordersTable.id,
            date: firstHistory.date,
            status: lastHistory.status,
            checkoutSessionId: ordersTable.checkoutSessionId
        })
        .from(ordersTable)
        .leftJoin(firstHistory, eq(firstHistory.orderId, ordersTable.id))
        .leftJoin(lastHistory, eq(lastHistory.orderId, ordersTable.id))
        .where(
            and(
                eq(ordersTable.userId, userId),
                eq(ordersTable.id, orderId),
                eq(
                    firstHistory.date,
                    db
                        .select({ date: sql`min(${orderHistoriesTable.date})` })
                        .from(orderHistoriesTable)
                        .where(eq(orderHistoriesTable.orderId, ordersTable.id))
                ),
                eq(
                    lastHistory.date,
                    db
                        .select({ date: sql`max(${orderHistoriesTable.date})` })
                        .from(orderHistoriesTable)
                        .where(eq(orderHistoriesTable.orderId, ordersTable.id))
                ),
                not(inArray(lastHistory.status, excludedStatuses))
            )
        )
        .orderBy(desc(ordersTable.id));

    await client.end();

    const checkoutSession = await stripe.checkout.sessions.retrieve(orders[0].checkoutSessionId, {
        expand: ['line_items']
    });

    const parsedOrder = z
        .object({
            id: z.number(),
            date: z.string(),
            status: orderStatusSchema
        })
        .parse({ ...orders[0], date: dayjs(orders[0].date as string).toISOString() });

    const parsedOrderLines = z.array(stripeOrderLineSchema).parse(checkoutSession.line_items.data);

    return { props: { order: parsedOrder, orderLines: parsedOrderLines } };
};
