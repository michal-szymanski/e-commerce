import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { getAuth } from '@clerk/nextjs/server';
import { env } from '@/env.mjs';
import { orderHistoriesTable, ordersTable } from '@/schema';
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm';
import { OrderStatus, orderStatusSchema } from '@/types';
import dayjs from 'dayjs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusBadge from '@/components/ui/custom/order-status-badge';
import { getProductUrl, getTotalPrice } from '@/lib/utils';
import stripe from '@/lib/stripe';
import { alias } from 'drizzle-orm/pg-core';
import Head from 'next/head';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import Stripe from 'stripe';
import Link from 'next/link';
import db from '@/lib/drizzle';

export default function Page({ order, lineItems }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const columns: ColumnDef<Stripe.LineItem>[] = [
        {
            id: 'name',
            header: () => <div className="text-left">Name</div>,
            cell: ({ row: { original: lineItem } }) => {
                const product = lineItem?.price?.product as Stripe.Product;
                return <div className="text-left">{product.name}</div>;
            }
        },
        {
            id: 'unit_amount',
            header: () => <div className="text-right">Unit Price</div>,
            cell: ({ row: { original: lineItem } }) => (
                <div className="text-right">
                    {getTotalPrice(lineItem.amount_total, 1)} {lineItem.currency.toUpperCase()}
                </div>
            )
        },
        {
            id: 'quantity',
            header: () => <div className="text-right">Quantity</div>,
            cell: ({ row: { original: lineItem } }) => <div className="text-right">{lineItem.quantity}</div>
        },
        {
            id: 'amount_total',
            header: () => <div className="text-right">Total Price</div>,
            cell: ({ row: { original: lineItem } }) => (
                <div className="text-right font-medium">
                    {getTotalPrice(lineItem.amount_total, 1)} {lineItem.currency.toUpperCase()}
                </div>
            )
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row: { original: lineItem } }) => {
                const product = lineItem?.price?.product as Stripe.Product;
                return (
                    <div className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <EllipsisHorizontalIcon className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                    <Link href={getProductUrl(product.id, product.name)}>View product page</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ];

    const formattedOrder = { ...order, date: dayjs(order.date as string).format('DD/MM/YYYY HH:mm') };
    const totalPrice = lineItems.reduce((acc, curr) => Number(acc + getTotalPrice(curr.amount_total, 1)), 0).toFixed(2);

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
                                Total Price:{' '}
                                <span className="font-semibold">
                                    {totalPrice} {lineItems[0].currency.toUpperCase()}
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <OrderStatusBadge status={formattedOrder.status} />
                        </CardFooter>
                    </Card>
                </header>
                <DataTable columns={columns} data={lineItems} />
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps<{
    order: { id: number; date: string; status: OrderStatus };
    lineItems: Stripe.LineItem[];
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

    const orderId = z.coerce.number().parse(context.query.id);

    const firstHistory = alias(orderHistoriesTable, 'oh1');
    const lastHistory = alias(orderHistoriesTable, 'oh2');

    const orders = await db
        .select({
            id: ordersTable.id,
            date: firstHistory.date,
            status: lastHistory.status,
            checkoutSessionId: ordersTable.checkoutSessionId,
            organizationId: ordersTable.organizationId
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
                isNotNull(ordersTable.checkoutSessionId)
            )
        )
        .orderBy(desc(ordersTable.id));

    if (!orders.length) {
        return {
            notFound: true
        };
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(z.string().parse(orders[0].checkoutSessionId), {
        expand: ['line_items.data.price.product']
    });

    const parsedOrder = z
        .object({
            id: z.number(),
            date: z.string(),
            status: orderStatusSchema
        })
        .parse({ ...orders[0], date: dayjs(orders[0].date as string).toISOString() });

    return {
        props: {
            order: parsedOrder,
            lineItems:
                checkoutSession.line_items?.data.filter((li) => (li.price?.product as Stripe.Product).metadata?.organizationId === orders[0].organizationId) ??
                []
        }
    };
};
