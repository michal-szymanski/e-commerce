import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { getAuth } from '@clerk/nextjs/server';
import postgres from 'postgres';
import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { orderLinesTable, ordersTable, productsTable } from '@/schema';
import { and, eq, sql } from 'drizzle-orm';
import { Order, orderSchema } from '@/types';
import dayjs from 'dayjs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusBadge from '@/components/ui/custom/order-status-badge';

const orderLineWithProduct = z.object({
    productId: z.number(),
    productName: z.string(),
    productPrice: z.string(),
    quantity: z.string(),
    totalPrice: z.string()
});

export default function Page({ order, orderLines }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();

    const columns: ColumnDef<z.infer<typeof orderLineWithProduct>>[] = [
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
                    <Button
                        variant="link"
                        onClick={async () => {
                            await router.push(`/products/${row.getValue('productId')}`);
                        }}
                    >
                        Product Page
                    </Button>
                </div>
            )
        }
    ];

    const formattedOrder = { ...order, date: dayjs(order.date).format('DD/MM/YYYY HH:mm') };
    const totalPrice = orderLines.reduce((acc, curr) => acc + +curr.totalPrice, 0);
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
    order: Order;
    orderLines: z.infer<typeof orderLineWithProduct>[];
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
            .select()
            .from(ordersTable)
            .where(and(eq(ordersTable.userId, userId), eq(ordersTable.id, orderId)))
    )[0];

    const orderLines = await db
        .select({
            productId: productsTable.id,
            productName: productsTable.name,
            productPrice: productsTable.price,
            quantity: orderLinesTable.quantity,
            totalPrice: sql`SUM(ROUND(${productsTable.price} * ${orderLinesTable.quantity}, 2))`
        })
        .from(orderLinesTable)
        .where(eq(orderLinesTable.orderId, order.id))
        .leftJoin(productsTable, eq(orderLinesTable.productId, productsTable.id))
        .groupBy(productsTable.id, orderLinesTable.quantity);

    await client.end();

    const parsedOrder = orderSchema.parse({ ...order, date: dayjs(order.date).toISOString() });
    const parsedOrderLines = z.array(orderLineWithProduct).parse(orderLines);

    return { props: { order: parsedOrder, orderLines: parsedOrderLines } };
};
