import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

type Props = {
    initialQuantity: number;
    handlePlus: () => void;
    handleMinus: () => void;
    handleBlur: (value: number) => void;
};

const QuantityCounter = ({ initialQuantity, handlePlus, handleMinus, handleBlur }: Props) => {
    const formSchema = z.object({
        quantity: z.string()
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: z.coerce.string().parse(initialQuantity)
        }
    });

    const currentQuantity = z.coerce.number().parse(form.watch().quantity);

    useEffect(() => {
        form.setValue('quantity', z.coerce.string().parse(initialQuantity));
    }, [initialQuantity, form]);

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

    return (
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
                                        onBlur={(e) => handleBlur(z.coerce.number().parse(e.target.value))}
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
    );
};

export default QuantityCounter;
