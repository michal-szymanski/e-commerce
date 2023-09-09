import { ProductWithMedia } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '@/store/slices/order';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useEffect } from 'react';
import { getTotalPrice } from '@/lib/utils';

type Props = {
    product: ProductWithMedia;
    initialQuantity: number;
};

const formSchema = z.object({
    quantity: z.string()
});

const CartItem = ({ product, initialQuantity }: Props) => {
    const dispatch = useDispatch();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: z.coerce.string().parse(initialQuantity)
        }
    });

    const currentQuantity = z.coerce.number().parse(form.watch().quantity);

    useEffect(() => {
        form.setValue('quantity', z.coerce.string().parse(initialQuantity));
    }, [initialQuantity]);

    const transformInputToNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const number = z.coerce.number().min(1).parse(event.target.value);
            return number > 0 ? z.coerce.string().parse(number) : '';
        } catch {
            const values = form.getValues();
            const name = event.target.name;
            return values[name as keyof typeof values];
        }
    };

    const handleMinus = () => {
        if (currentQuantity === 1) return;

        dispatch(updateQuantity({ productId: product.id, quantity: currentQuantity - 1 }));
    };

    const handlePlus = () => {
        dispatch(updateQuantity({ productId: product.id, quantity: currentQuantity + 1 }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        dispatch(updateQuantity({ productId: product.id, quantity: z.coerce.number().parse(e.target.value) }));
    };

    const handleRemove = () => {
        dispatch(removeFromCart({ productId: product.id }));
    };

    return (
        <Card className="w-[700px]">
            <CardHeader>
                <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
                <Image src={product.src} alt={product.name} width={50} height={50} />
                <div className="flex h-full w-full items-center justify-between px-5">
                    <span>{product.price} zł</span>
                    <span>
                        <XMarkIcon className="h-4 w-4" />
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="h-min rounded-full p-2" onClick={handleMinus} disabled={currentQuantity === 1}>
                            <MinusIcon className="h-4 w-4" />
                        </Button>
                        <Form {...form}>
                            <form onSubmit={(e) => e.preventDefault()} className="h-full">
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className="w-16 text-center"
                                                    onChange={(e) => field.onChange(transformInputToNumber(e))}
                                                    onBlur={(e) => handleBlur(e)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                        <Button variant="ghost" className="h-min rounded-full p-2" onClick={handlePlus}>
                            <PlusIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="font-bold">{getTotalPrice(product, currentQuantity)} zł</span>
                    <Button variant="ghost" className="text-red-500 hover:bg-red-500 hover:text-white" onClick={handleRemove}>
                        Remove
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default CartItem;
