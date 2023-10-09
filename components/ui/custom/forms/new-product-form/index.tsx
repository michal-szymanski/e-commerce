import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/ui/custom/submit-button';
import { useRouter } from 'next/router';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProduct } from '@/hooks/mutations';

const formSchema = z.object({
    name: z.string().nonempty({ message: 'Name is required' }),
    description: z.string().nonempty({ message: 'Description is required' }),
    price: z.string().nonempty({ message: 'Price is required' })
});

type Props = {
    setProduct: (product: { id: ''; name: string; price: number; description: string }) => void;
};

const NewProductForm = ({ setProduct }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            price: ''
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();
    const createProduct = useCreateProduct();

    const onSubmit = async ({ name, description, price }: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            await createProduct.mutateAsync({ name, description, price: Number(price) });
            setIsSuccess(true);
        } catch (error) {
            console.error(error);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        const subscription = form.watch(({ name, description, price }) => {
            setProduct({
                id: '',
                name: name ?? '',
                description: description ?? '',
                price: Number(price ?? 0)
            });
        });
        return () => subscription.unsubscribe();
    }, [form, setProduct]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader></CardHeader>
                    <CardContent>
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
                            name="price"
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
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2">
                        <SubmitButton
                            key={form.formState.submitCount}
                            isLoading={isLoading}
                            isSuccess={isSuccess}
                            onAnimationComplete={() =>
                                setTimeout(() => {
                                    // router.push('/dashboard/products');
                                }, 1000)
                            }
                        />
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default NewProductForm;
