import { DataTable } from '@/components/ui/data-table';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { idSchema, orderStatusSchema } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { env } from '@/env.mjs';
import { getAuth } from '@clerk/nextjs/server';
import { orderHistoriesTable, ordersTable } from '@/schema';
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import stripe from '@/lib/stripe';
import { alias } from 'drizzle-orm/pg-core';
import Head from 'next/head';
import { getTotalPrice } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import OrderStatusBadge from '@/components/ui/custom/order-status-badge';
import Stripe from 'stripe';
import db from '@/lib/drizzle';
import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';
import { formatDate } from '@/lib/dayjs';

const orderWithTotalPriceSchema = z.object({
    id: idSchema,
    date: z.string(),
    status: orderStatusSchema,
    totalPrice: z.string(),
    currency: z.string()
});

export default function Page({ orders }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const columns: ColumnDef<z.infer<typeof orderWithTotalPriceSchema>>[] = [
        {
            id: 'id',
            header: () => <div className="text-left">Id</div>,
            cell: ({ row: { original: order } }) => <div className="text-left">{order.id}</div>
        },
        {
            id: 'date',
            header: () => <div className="text-left">Date</div>,
            cell: ({ row: { original: order } }) => <div className="text-left">{order.date}</div>
        },
        {
            id: 'status',
            header: () => <div className="text-center">Status</div>,
            cell: ({ row: { original: order } }) => (
                <div className="text-center">
                    <OrderStatusBadge status={order.status} />
                </div>
            )
        },
        {
            id: 'totalPrice',
            header: () => <div className="text-right">Total price</div>,
            cell: ({ row: { original: order } }) => (
                <div className="text-right font-medium">
                    {order.totalPrice} {order.currency.toUpperCase()}
                </div>
            )
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row: { original: order } }) => {
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
                                    <Link href={`/orders/${order.id}`}>View order details</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ];

    const data = orders.map((o) => ({ ...o, date: formatDate(o.date) }));

    return (
        <>
            <Head>
                <title>{`Orders | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={data} />
            </div>
        </>
    );
}

Page.getLayout = (page: ReactNode) => {
    return <DefaultLayout>{page}</DefaultLayout>;
};

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

    const ordersWithTotals = orders.map(async (o) => {
        const session = await stripe.checkout.sessions.retrieve(z.string().parse(o.checkoutSessionId), {
            expand: ['line_items.data.price.product']
        });

        return {
            ...o,
            date: dayjs(o.date as string).toISOString(),
            totalPrice: (
                session.line_items?.data
                    .filter((li) => (li.price?.product as Stripe.Product).metadata?.organizationId === o.organizationId)
                    .reduce((acc, curr) => acc + Number(getTotalPrice(curr.amount_total, 1)), 0) ?? 0
            ).toFixed(2),
            currency: session.line_items?.data[0]?.currency ?? ''
        };
    });

    const parsedOrdersWithTotals = z.array(orderWithTotalPriceSchema).parse(await Promise.all(ordersWithTotals));

    return { props: { orders: parsedOrdersWithTotals } };
};
