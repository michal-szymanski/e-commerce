import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
    minPrice: z.string(),
    maxPrice: z.string()
});

const Sidebar = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            minPrice: '',
            maxPrice: ''
        }
    });
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    const transformInputToNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const number = z.coerce.number().parse(event.target.value);
            return number > 0 ? z.coerce.string().parse(number) : '';
        } catch {
            const values = form.getValues();
            const name = event.target.name;
            return values[name as keyof typeof values];
        }
    };

    return (
        <aside className="h-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
                    <h2 className="mb-5 text-lg font-semibold tracking-tight">Price</h2>
                    <div className="flex gap-2">
                        <FormField
                            control={form.control}
                            name="minPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Min" {...field} onChange={(e) => field.onChange(transformInputToNumber(e))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="maxPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Max" {...field} onChange={(e) => field.onChange(transformInputToNumber(e))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-end gap-5 pt-10">
                        <Button type="button" variant="secondary" onClick={() => form.reset()} className="flex-1">
                            Reset
                        </Button>
                        <Button type="submit" variant="default" className="flex-1">
                            Filter
                        </Button>
                    </div>
                </form>
            </Form>
        </aside>
    );
};

export default Sidebar;
