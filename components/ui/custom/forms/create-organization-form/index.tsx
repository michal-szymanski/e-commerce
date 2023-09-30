import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, useOrganizationList } from '@clerk/nextjs';
import { Dispatch, SetStateAction } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

const formSchema = z.object({
    name: z.string().nonempty({ message: 'Name is required' })
});

type Props = {
    setSummaryErrors: Dispatch<SetStateAction<{ id: string; message: string }[]>>;
};

const CreateOrganizationForm = ({ setSummaryErrors }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ''
        }
    });

    const router = useRouter();

    const { createOrganization, isLoaded, setActive } = useOrganizationList({});

    const onSubmit = async ({ name }: z.infer<typeof formSchema>) => {
        if (!createOrganization) return;

        try {
            const organization = await createOrganization({
                name
            });

            await router.push('/');
            await setActive({ organization });
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                setSummaryErrors(error.errors.map((e) => ({ id: e.code, message: e.longMessage ?? e.message })));
                return;
            }

            console.error({ error });
        }
    };

    if (!isLoaded) return null;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="">
                    <CardHeader>
                        <CardTitle>Create Organization</CardTitle>
                    </CardHeader>
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
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2">
                        <Button type="submit" className="w-full">
                            Submit
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default CreateOrganizationForm;
