import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useReducer } from 'react';
import { isClerkAPIResponseError, isKnownError, useUser } from '@clerk/nextjs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/ui/custom/submit-button';
import { useToast } from '@/components/ui/use-toast';
import submitButtonReducer from '@/components/ui/custom/submit-button/reducer';

const formSchema = z
    .object({
        currentPassword: z.string().min(1, { message: 'Current password is required' }),
        newPassword: z.string().min(1, { message: 'New password is required' }),
        confirmNewPassword: z.string().min(1, { message: 'Please confirm new password' })
    })
    .refine(({ newPassword, confirmNewPassword }) => newPassword === confirmNewPassword, {
        message: "Passwords don't match",
        path: ['confirmNewPassword']
    });

const PasswordForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        }
    });

    const [state, dispatch] = useReducer(submitButtonReducer, { isLoading: false, isSuccess: false, isError: false });

    const { user, isLoaded: isClerkLoaded } = useUser();

    const { toast } = useToast();

    const clerkErrorFieldMap = new Map<string, keyof z.infer<typeof formSchema>>([
        ['current_password', 'currentPassword'],
        ['new_password', 'newPassword']
    ]);

    const onSubmit = async ({ currentPassword, newPassword }: z.infer<typeof formSchema>) => {
        if (!user) return;
        dispatch({ type: 'loading' });

        try {
            await user.updatePassword({ currentPassword, newPassword });
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
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current password</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New password</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm new password</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <SubmitButton
                    state={state}
                    onAnimationComplete={() =>
                        setTimeout(async () => {
                            dispatch({ type: 'reset' });
                            form.reset();
                        }, 1000)
                    }
                />
            </form>
        </Form>
    );
};

export default PasswordForm;
