import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { getAuth } from '@clerk/nextjs/server';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { orderHistoriesTable, ordersTable } from '@/schema';
import { and, eq, sql } from 'drizzle-orm';
import { CartItem, OrderLineWithProduct, orderLineWithProductSchema, OrderStatus, orderStatusSchema, StripePrice } from '@/types';
import dayjs from 'dayjs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusBadge from '@/components/ui/custom/order-status-badge';
import Link from 'next/link';
import { getProductUrl } from '@/lib/utils';
import { getOrderLinesWithProducts } from '@/sql-service';

export default function Page({ order, orderLines }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const columns: ColumnDef<OrderLineWithProduct>[] = [
        {
            accessorKey: 'productId',
            header: 'Id'
        },
        {
            accessorKey: 'productName',
            header: 'Name'
        },
        {
            accessorKey: 'productPrice',
            header: () => <div className="text-right">Unit Price</div>,
            cell: ({ row }) => <div className="text-right">{row.getValue('productPrice')}</div>
        },
        {
            accessorKey: 'quantity',
            header: () => <div className="text-right">Quantity</div>,
            cell: ({ row }) => <div className="text-right">{z.coerce.number().parse(row.getValue('quantity'))}</div>
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
                    <Link href={getProductUrl(row.getValue('productId'), row.getValue('productName'))}>
                        <Button variant="link">Product Page</Button>
                    </Link>
                </div>
            )
        }
    ];

    const formattedOrder = { ...order, date: dayjs(order.date as string).format('DD/MM/YYYY HH:mm') };
    const totalPrice = orderLines.reduce((acc, curr) => acc + curr.totalPrice, 0);

    return (
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
            <DataTable columns={columns} data={orderLines} />
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<{
    order: { id: number; date: string; status: OrderStatus };
    orderLines: OrderLineWithProduct[];
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

    const order = (
        await db
            .select({
                id: ordersTable.id,
                date: sql`min(${orderHistoriesTable.date})`,
                status: sql`max(${orderHistoriesTable.status})`
            })
            .from(ordersTable)
            .leftJoin(orderHistoriesTable, eq(orderHistoriesTable.orderId, ordersTable.id))
            .where(and(eq(ordersTable.userId, userId), eq(ordersTable.id, orderId)))
            .groupBy(ordersTable.id)
    )[0];

    const orderLines = await getOrderLinesWithProducts(db, order.id);

    await client.end();

    const parsedOrder = z
        .object({
            id: z.number(),
            date: z.string(),
            status: orderStatusSchema
        })
        .parse({ ...order, date: dayjs(order.date as Date).toISOString() });

    const parsedOrderLines = z.array(orderLineWithProductSchema).parse(orderLines);

    return { props: { order: parsedOrder, orderLines: parsedOrderLines } };
};
