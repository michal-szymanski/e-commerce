import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
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
import { getProductPageUrl, getTotalPrice } from '@/lib/utils';
import { useCategories, useOrganizationProducts } from '@/hooks/queries';
import { useOrganization, useUser } from '@clerk/nextjs';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import stripe from '@/lib/stripe';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import NewProductForm from '@/components/ui/custom/forms/new-product-form';
import { ReactNode, useEffect, useState } from 'react';
import ProductPage from '@/components/ui/custom/product-page';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import db from '@/lib/drizzle';
import { categoriesTable } from '@/schema';
import { categorySchema } from '@/types';
import { z } from 'zod';

const Page = () => {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data } = useOrganizationProducts({ enabled: !!isSignedIn && !!organization });
    const { data: categories } = useCategories();
    const [{ name, description, unitAmount }, setPreviewData] = useState({ name: '', description: '', unitAmount: 0 });
    const [open, setOpen] = useState(false);
    const [initialData, setInitialData] = useState<Stripe.Product>();

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
            id: 'category',
            header: 'Category',
            cell: ({ row: { original: product } }) => categories?.find((c) => c.id === Number(product.metadata?.categoryId))?.name
        },
        {
            accessorKey: 'active',
            header: 'Active'
        },
        {
            id: 'unit_amount',
            header: () => <div className="text-right">Unit amount</div>,
            cell: ({ row: { original: product } }) => (
                <div className="text-right font-medium">{getTotalPrice((product.default_price as Stripe.Price)?.unit_amount ?? 0, 1)} PLN</div>
            )
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row: { original: product } }) => {
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
                                <DropdownMenuItem
                                    onClick={() => {
                                        setInitialData(product);
                                        setPreviewData({
                                            name: product.name,
                                            description: product.description ?? '',
                                            unitAmount: (product.default_price as Stripe.Price).unit_amount ?? 0
                                        });
                                        setOpen(true);
                                    }}
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {product.active && (
                                    <DropdownMenuItem onClick={() => router.push(getProductPageUrl(product.id, product.name))}>
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

    useEffect(() => {
        if (!open) {
            setInitialData(undefined);
            setPreviewData({ name: '', description: '', unitAmount: 0 });
        }
    }, [open]);

    return (
        <div>
            <h1 className="pb-10 text-4xl font-bold">Products</h1>
            <div className="container relative mx-auto py-10">
                <Card>
                    <CardHeader className="flex flex-row items-end justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Your products</h2>
                            <CardDescription>Total: {data?.length ?? 0}</CardDescription>
                        </div>
                        <div>
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button>
                                        <span>
                                            <PlusIcon className="h-4 w-4" />
                                        </span>
                                        <span className="pl-3">Add Product</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent onPointerDownOutside={(e) => e.preventDefault()}>
                                    <SheetHeader className="pb-10">
                                        <SheetTitle>{initialData ? 'Edit product' : 'Add new product'}</SheetTitle>
                                        <SheetDescription>
                                            Fill out the form to {initialData ? 'edit the' : 'create a new'} product. You can see the preview of your product to
                                            the left.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <NewProductForm
                                        setPreviewData={(value) => setPreviewData(value)}
                                        close={() => {
                                            setOpen(false);
                                        }}
                                        initialData={initialData}
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={data ?? []} />
                    </CardContent>
                </Card>
                <AnimatePresence>
                    {open && (
                        <motion.div className="absolute left-0 top-0 z-[51]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <h2 className="pb-10 text-4xl font-extrabold text-green-600">Preview</h2>
                            <ProductPage
                                isPreview
                                name={name}
                                price={unitAmount}
                                currency="pln"
                                images={[
                                    'https://images.unsplash.com/photo-1578849278619-e73505e9610f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80'
                                ]}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default Page;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { userId, orgId } = getAuth(context.req);

    if (!userId || !orgId) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(['organization-products'], async () => {
        const { data: products } = await stripe.products.search({ query: `metadata["organizationId"]:"${orgId}"`, limit: 100, expand: ['data.default_price'] });
        return products.sort((a, b) => b.created - a.created);
    });

    await queryClient.prefetchQuery(['categories'], async () => {
        const categories = await db.select().from(categoriesTable);
        return z.array(categorySchema).parse(categories);
    });

    return {
        props: { dehydratedState: dehydrate(queryClient) }
    };
};
