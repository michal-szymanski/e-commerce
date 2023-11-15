import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { getAuth } from '@clerk/nextjs/server';
import { env } from '@/env.mjs';
import { orderHistoriesTable, ordersTable } from '@/schema';
import { and, desc, eq, isNotNull, or } from 'drizzle-orm';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusBadge from '@/components/ui/custom/order-status-badge';
import { getProductPageUrl, getTotalPrice } from '@/lib/utils';
import stripe from '@/lib/stripe';
import Head from 'next/head';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import Stripe from 'stripe';
import Link from 'next/link';
import db from '@/lib/drizzle';
import { ReactNode } from 'react';
import DefaultLayout from '@/components/layouts/default-layout';
import BusinessAccount from '@/components/utils/business-account';
import { useOrderHistories } from '@/hooks/queries';
import { formatDate } from '@/lib/dayjs';
import { useChangeOrderStatus } from '@/hooks/mutations';
import { dehydrate, DehydratedState, QueryClient } from '@tanstack/react-query';

export default function Page({ orderId, lineItems }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { data: orderHistories } = useOrderHistories({ orderId });
    const firstHistory = orderHistories?.[0];
    const lastHistory = orderHistories?.[orderHistories.length - 1];
    const changeOrderStatus = useChangeOrderStatus();

    const renderMoveToStatusButton = () => {
        if (lastHistory?.status === 'New') {
            return (
                <Button type="button" onClick={() => changeOrderStatus.mutate({ orderId, status: 'In Progress' })}>
                    Move to In Progress
                </Button>
            );
        }
        if (lastHistory?.status === 'In Progress') {
            return (
                <Button type="button" onClick={() => changeOrderStatus.mutate({ orderId, status: 'Completed' })}>
                    Move to Completed
                </Button>
            );
        }

        return null;
    };

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
                                    <Link href={getProductPageUrl(product.id, product.name)}>View product page</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ];

    const totalPrice = lineItems.reduce((acc, curr) => Number(acc + getTotalPrice(curr.amount_total, 1)), 0).toFixed(2);
    const showMoveToStatusButton = lastHistory?.status === 'New' || lastHistory?.status === 'In Progress';

    return (
        <>
            <Head>
                <title>{`Order | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container mx-auto py-10">
                <header className="mb-10 grid grid-flow-col grid-cols-4 gap-10">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order {orderId}</CardTitle>
                            {firstHistory && <CardDescription>{formatDate(firstHistory.date)}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg">
                                Total Price:{' '}
                                <span className="font-semibold">
                                    {totalPrice} {lineItems[0].currency.toUpperCase()}
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter>{lastHistory && <OrderStatusBadge status={lastHistory.status} />}</CardFooter>
                    </Card>
                    <BusinessAccount>
                        <Card>
                            <CardHeader>
                                <CardTitle>Order History</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                {[...(orderHistories ?? [])]
                                    .sort((a, b) => b.id - a.id)
                                    .map((oh) => (
                                        <div key={oh.id} className="flex items-center justify-between gap-3">
                                            <OrderStatusBadge status={oh.status} />
                                            <CardDescription>{formatDate(oh.date)}</CardDescription>
                                        </div>
                                    ))}
                            </CardContent>
                        </Card>
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle>Change Status</CardTitle>
                            </CardHeader>
                            <CardContent className="flex grow flex-col justify-end gap-2">
                                {showMoveToStatusButton && renderMoveToStatusButton()}
                                <Button type="button" variant={showMoveToStatusButton ? 'secondary' : 'default'}>
                                    Select status
                                </Button>
                            </CardContent>
                        </Card>
                    </BusinessAccount>
                </header>
                <DataTable columns={columns} data={lineItems} />
            </div>
        </>
    );
}

Page.getLayout = (page: ReactNode) => {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export const getServerSideProps: GetServerSideProps<{
    orderId: number;
    lineItems: Stripe.LineItem[];
    dehydratedState: DehydratedState;
}> = async (context) => {
    const { userId, orgId } = getAuth(context.req);

    if (!userId) {
        return {
            redirect: {
                destination: '/sign-in',
                permanent: false
            }
        };
    }

    const orderId = z.coerce.number().parse(context.query.id);

    const orders = await db
        .select({
            id: ordersTable.id,
            checkoutSessionId: ordersTable.checkoutSessionId,
            organizationId: ordersTable.organizationId
        })
        .from(ordersTable)
        .where(
            and(
                or(eq(ordersTable.userId, userId), eq(ordersTable.organizationId, orgId ?? '')),
                eq(ordersTable.id, orderId),
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

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(['order-histories', { orderId }], async () => {
        const data = await db.select().from(orderHistoriesTable).where(eq(orderHistoriesTable.orderId, orderId));
        console.log({ data });
        return data;
    });

    return {
        props: {
            orderId,
            lineItems:
                checkoutSession.line_items?.data.filter((li) => (li.price?.product as Stripe.Product).metadata?.organizationId === orders[0].organizationId) ??
                [],
            dehydratedState: dehydrate(queryClient)
        }
    };
};
