import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useReducer } from 'react';
import { isClerkAPIResponseError, isKnownError, useUser } from '@clerk/nextjs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/ui/custom/submit-button';
import { useToast } from '@/components/ui/use-toast';
import submitButtonReducer from '@/components/ui/custom/submit-button/reducer';

const formSchema = z.object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' })
});

const ProfileForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: ''
        }
    });

    const [state, dispatch] = useReducer(submitButtonReducer, { isLoading: false, isSuccess: false, isError: false });

    const { user, isLoaded: isClerkLoaded } = useUser();

    const { toast } = useToast();

    const clerkErrorFieldMap = new Map<string, keyof z.infer<typeof formSchema>>([
        ['first_name', 'firstName'],
        ['last_name', 'lastName']
    ]);

    useEffect(() => {
        if (!user) return;
        form.setValue('firstName', user.firstName ?? '');
        form.setValue('lastName', user.lastName ?? '');
    }, [user, form]);

    const onSubmit = async ({ firstName, lastName }: z.infer<typeof formSchema>) => {
        if (!user) return;

        dispatch({ type: 'loading' });

        try {
            await user.update({ firstName, lastName });
            dispatch({ type: 'success' });
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <SubmitButton state={state} onAnimationComplete={() => setTimeout(async () => dispatch({ type: 'reset' }), 1000)} />
            </form>
        </Form>
    );
};

export default ProfileForm;
