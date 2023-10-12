import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/ui/custom/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProduct, useUpdateProduct } from '@/hooks/mutations';
import { Button } from '@/components/ui/button';
import Stripe from 'stripe';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { InformationCircleIcon } from '@heroicons/react/20/solid';

const formSchema = z.object({
    name: z.string().nonempty({ message: 'Name is required' }),
    description: z.string().nonempty({ message: 'Description is required' }),
    unitAmount: z.string().nonempty({ message: 'Price is required' }),
    active: z.boolean().optional()
});

type Props = {
    setPreviewData: (previewData: { name: string; description: string; unitAmount: number }) => void;
    close: () => void;
    initialData?: Stripe.Product;
};

const NewProductForm = ({ setPreviewData, close, initialData }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name ?? '',
            description: initialData?.description ?? '',
            unitAmount: (initialData?.default_price as Stripe.Price | undefined)?.unit_amount?.toString() ?? '',
            active: initialData?.active ?? false
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const onSubmit = async ({ name, description, unitAmount, active }: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            if (initialData) {
                const isPriceUpdated = (initialData.default_price as Stripe.Price).unit_amount !== Number(unitAmount);
                const isNameUpdated = initialData.name !== name;
                const isDescriptionUpdated = initialData.description !== description;
                const isActiveUpdated = initialData.active !== active;

                if (isPriceUpdated || isNameUpdated || isDescriptionUpdated || isActiveUpdated) {
                    updateProduct.mutate({
                        productId: initialData.id,
                        priceId: isPriceUpdated ? (initialData.default_price as Stripe.Price).id : undefined,
                        name: isNameUpdated ? name : undefined,
                        description: isDescriptionUpdated ? description : undefined,
                        unitAmount: isPriceUpdated ? Number(unitAmount) : undefined,
                        active: isActiveUpdated ? active : undefined
                    });
                }
            } else {
                createProduct.mutate({ name, description, price: Number(unitAmount), active: active ?? false });
            }
            setIsSuccess(true);
        } catch (error) {
            console.error(error);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        const subscription = form.watch(({ name, description, unitAmount }) => {
            setPreviewData({
                name: name ?? '',
                description: description ?? '',
                unitAmount: Number(unitAmount ?? 0)
            });
        });
        return () => subscription.unsubscribe();
    }, [form, setPreviewData]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <div className="h-5">
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unitAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <div className="h-5">
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-3">
                                <FormLabel>Active</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger type="button">
                                            <span className="sr-only">Information icon about active and inactive products</span>
                                            <InformationCircleIcon className="h-5 w-5" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Inactive products will not be visible to customers and cannot be bought</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="h-5">
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe your product" className="resize-none" {...field} />
                            </FormControl>
                            <div className="h-5">
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-5 py-5">
                    <Button type="button" variant="secondary" onClick={close}>
                        Cancel
                    </Button>
                    <SubmitButton
                        key={form.formState.submitCount}
                        isLoading={isLoading}
                        isSuccess={isSuccess}
                        onAnimationComplete={() => setTimeout(close, 1000)}
                    />
                </div>
            </form>
        </Form>
    );
};

export default NewProductForm;
