import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { ReactNode } from 'react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import db from '@/lib/drizzle';
import { orderHistoriesTable, ordersTable } from '@/schema';
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { orderStatusSchema } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/router';
import { formatDate } from '@/lib/dayjs';
import OrderStatusBadge from '@/components/ui/custom/order-status-badge';

const rowSchema = z.object({
    id: z.number(),
    date: z.string(),
    status: orderStatusSchema
});

type Row = z.infer<typeof rowSchema>;

const Page = ({ orders }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();

    const columns: ColumnDef<Row>[] = [
        {
            id: 'id',
            header: 'Id',
            cell: ({ row: { original: order } }) => order.id
        },
        {
            id: 'date',
            header: 'Date',
            cell: ({ row: { original: order } }) => order.date
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row: { original: order } }) => <OrderStatusBadge status={order.status} />
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
                                <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>View order</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ];

    const data = orders.map((o) => ({ ...o, date: formatDate(o.date) }));

    return (
        <div className="container relative mx-auto py-10">
            <h1 className="pb-10 text-4xl font-bold">Orders</h1>
            <Card>
                <CardHeader />
                <CardContent>
                    <DataTable columns={columns} data={data} />
                </CardContent>
            </Card>
        </div>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default Page;

export const getServerSideProps: GetServerSideProps<{ orders: Row[] }> = async (context) => {
    const { userId, orgId } = getAuth(context.req);

    if (!userId || !orgId) {
        return {
            redirect: {
                destination: '/',
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
            status: lastHistory.status
        })
        .from(ordersTable)
        .leftJoin(firstHistory, eq(firstHistory.orderId, ordersTable.id))
        .leftJoin(lastHistory, eq(lastHistory.orderId, ordersTable.id))
        .where(
            and(
                eq(ordersTable.organizationId, orgId),
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

    return {
        props: {
            orders: z.array(rowSchema).parse(orders)
        }
    };
};
