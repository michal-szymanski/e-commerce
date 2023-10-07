import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import stripe from '@/lib/stripe';
import Stripe from 'stripe';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/router';
import { EllipsisHorizontalIcon, PlusIcon } from '@heroicons/react/20/solid';
import { getProductUrl } from '@/lib/utils';
import Link from 'next/link';

const Page = ({ products }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    console.log({ products });

    const router = useRouter();
    const columns: ColumnDef<Stripe.Product>[] = [
        {
            accessorKey: 'id',
            header: 'Id'
        },
        {
            accessorKey: 'name',
            header: 'Name'
        },
        {
            accessorKey: 'active',
            header: 'Active'
        },
        {
            id: 'unit_amount',
            accessorKey: 'default_price.unit_amount',
            header: () => <div className="text-right">Price</div>,
            cell: ({ row }) => <div className="text-right font-medium">{Number(row.getValue('unit_amount')) / 100} PLN</div>
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
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
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${row.getValue('id')}`)}>Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {Boolean(row.getValue('active')) && (
                                    <DropdownMenuItem onClick={() => router.push(getProductUrl(row.getValue('id'), row.getValue('name')))}>
                                        View product page
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>View orders with this product</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ];

    return (
        <div>
            <h1 className="pb-10 text-4xl font-bold">Products</h1>
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader className="flex flex-row items-end justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Your products</h2>
                            <CardDescription>Total: {products.length}</CardDescription>
                        </div>
                        <div>
                            <Button asChild>
                                <Link href="/dashboard/products/add">
                                    <span>
                                        <PlusIcon className="h-4 w-4" />
                                    </span>
                                    <span className="pl-3">Add Product</span>
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={products} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Page;

export const getServerSideProps: GetServerSideProps<{ products: Stripe.Product[] }> = async (context) => {
    const { userId, orgId } = getAuth(context.req);

    if (!userId || !orgId) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    const { data: products } = await stripe.products.search({ query: `metadata["organizationId"]:"${1}"`, expand: ['data.default_price'] });

    return {
        props: { products }
    };
};
