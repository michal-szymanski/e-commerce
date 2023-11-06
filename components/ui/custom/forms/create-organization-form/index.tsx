import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, isKnownError, useOrganizationList } from '@clerk/nextjs';
import { useReducer, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/router';
import SubmitButton from '@/components/ui/custom/submit-button';
import { SetActiveParams } from '@clerk/types';
import { useToast } from '@/components/ui/use-toast';
import submitButtonReducer from '@/components/ui/custom/submit-button/reducer';

const formSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' })
});

const CreateOrganizationForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ''
        }
    });

    const router = useRouter();

    const [state, dispatch] = useReducer(submitButtonReducer, { isLoading: false, isSuccess: false, isError: false });
    const [submitData, setSubmitData] = useState<SetActiveParams>();
    const { createOrganization, isLoaded: isClerkLoaded, setActive } = useOrganizationList();
    const { toast } = useToast();

    const clerkErrorFieldMap = new Map<string, keyof z.infer<typeof formSchema>>([['organization_name', 'name']]);

    const onSubmit = async ({ name }: z.infer<typeof formSchema>) => {
        if (!createOrganization) return;
        dispatch({ type: 'loading' });

        try {
            const organization = await createOrganization({
                name
            });
            dispatch({ type: 'success' });
            setSubmitData({ organization });
        } catch (error) {
            dispatch({ type: 'error' });
            if (isKnownError(error) && isClerkAPIResponseError(error)) {
                for (let e of error.errors) {
                    const field = clerkErrorFieldMap.get(e.meta?.paramName ?? '');

                    if (field) {
                        form.setError(field, { message: e.longMessage ?? e.message });
                    } else {
                        toast({
                            variant: 'destructive',
                            title: 'Heads up!',
                            description: e.longMessage ?? e.message
                        });
                    }
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Heads up!',
                    description: 'There was an error while submitting the form. Please try again.'
                });
            }
        }
    };

    if (!isClerkLoaded) return null;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2">
                        <SubmitButton
                            state={state}
                            onAnimationComplete={() =>
                                setTimeout(async () => {
                                    if (!submitData) return;
                                    await router.push('/');
                                    await setActive(submitData);
                                }, 1000)
                            }
                        />
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default CreateOrganizationForm;
