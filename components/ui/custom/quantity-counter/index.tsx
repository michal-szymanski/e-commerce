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
    allowDecimal: boolean;
};

const QuantityCounter = ({ initialQuantity, handlePlus, handleMinus, handleBlur, allowDecimal }: Props) => {
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
                                        onChange={(e) => {
                                            try {
                                                const { value } = e.target;
                                                if (value) {
                                                    if (!allowDecimal) {
                                                        z.array(z.string()).length(1).parse(value.split('.'));
                                                    }
                                                    z.coerce.number().min(1).parse(value);
                                                }
                                                field.onChange(e);
                                            } catch {
                                                e.preventDefault();
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = e.target.value || '1';
                                            form.setValue(field.name, value);
                                            handleBlur(z.coerce.number().parse(value));
                                            field.onBlur();
                                        }}
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
