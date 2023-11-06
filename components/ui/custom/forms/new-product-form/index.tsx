import { z } from 'zod';
import { useEffect, useReducer } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import { getTotalPrice } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/queries';
import submitButtonReducer from '@/components/ui/custom/submit-button/reducer';

const stripeMaxUnitAmount = 99999999;

const formSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    category: z.string().min(1, { message: 'Category is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    unitAmount: z
        .string()
        .min(1, { message: 'Unit amount is required' })
        .refine(
            (val) =>
                z.coerce
                    .number()
                    .max(stripeMaxUnitAmount / 100)
                    .safeParse(val).success,
            {
                message: `Unit amount cannot be higher than ${stripeMaxUnitAmount / 100}`
            }
        ),
    active: z.boolean().optional()
});

type Props = {
    setPreviewData: (previewData: { name: string; description: string; unitAmount: number }) => void;
    close: () => void;
    initialData?: Stripe.Product;
};

const NewProductForm = ({ setPreviewData, close, initialData }: Props) => {
    const initialDefaultPrice = initialData?.default_price as Stripe.Price;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name ?? '',
            description: initialData?.description ?? '',
            unitAmount: initialDefaultPrice?.unit_amount ? getTotalPrice(initialDefaultPrice.unit_amount, 1) : '',
            active: initialData?.active ?? false,
            category: initialData?.metadata?.categoryId ?? ''
        }
    });

    const [state, dispatch] = useReducer(submitButtonReducer, { isLoading: false, isSuccess: false, isError: false });
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const { data: categories } = useCategories();

    const onSubmit = async ({ name, description, unitAmount, active, category }: z.infer<typeof formSchema>) => {
        dispatch({ type: 'loading' });

        try {
            const newUnitAmount = Number(unitAmount) * 100;

            if (initialData) {
                const isPriceUpdated = initialDefaultPrice?.unit_amount !== newUnitAmount;
                const isNameUpdated = initialData.name !== name;
                const isDescriptionUpdated = initialData.description !== description;
                const isActiveUpdated = initialData.active !== active;
                const isCategoryUpdated = initialData.metadata?.categoryId !== category;

                if (isPriceUpdated || isNameUpdated || isDescriptionUpdated || isActiveUpdated || isCategoryUpdated) {
                    updateProduct.mutate({
                        productId: initialData.id,
                        priceId: isPriceUpdated ? initialDefaultPrice?.id : undefined,
                        name: isNameUpdated ? name : undefined,
                        description: isDescriptionUpdated ? description : undefined,
                        unitAmount: isPriceUpdated ? newUnitAmount : undefined,
                        active: isActiveUpdated ? active : undefined,
                        categoryId: isCategoryUpdated ? Number(category) : undefined
                    });
                }
            } else {
                createProduct.mutate({
                    name,
                    description,
                    unitAmount: newUnitAmount,
                    active: active ?? false,
                    categoryId: Number(category)
                });
            }
            dispatch({ type: 'success' });
        } catch (error) {
            dispatch({ type: 'error' });
            console.error(error);
        }
    };

    useEffect(() => {
        const subscription = form.watch(({ name, description, unitAmount }) => {
            setPreviewData({
                name: name ?? '',
                description: description ?? '',
                unitAmount: Number(unitAmount ?? 0) * 100
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
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories?.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unitAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unit amount</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    onChange={(e) => {
                                        try {
                                            const { value } = e.target;
                                            if (value) {
                                                z.coerce.number().min(1).parse(value);
                                            }
                                            field.onChange(e);
                                        } catch {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
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
                                            <span className="sr-only">Info icon</span>
                                            <InformationCircleIcon className="h-5 w-5" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Inactive products will not be visible to customers and cannot be bought</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <FormMessage />
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
                                <Textarea className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-5 py-5">
                    <Button type="button" variant="secondary" onClick={close} disabled={state.isLoading || state.isSuccess}>
                        Cancel
                    </Button>
                    <SubmitButton state={state} onAnimationComplete={() => setTimeout(close, 1000)} />
                </div>
            </form>
        </Form>
    );
};

export default NewProductForm;
