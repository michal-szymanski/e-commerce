import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/ui/custom/submit-button';
import { useReducer, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, isKnownError, useSignIn } from '@clerk/nextjs';
import { SetActiveParams } from '@clerk/types';
import { useRouter } from 'next/router';
import { useToast } from '@/components/ui/use-toast';
import submitButtonReducer from '@/components/ui/custom/submit-button/reducer';

const formSchema = z
    .object({
        code: z.string().min(1, { message: 'Code is required' }),
        password: z.string().min(1, { message: 'Password is required' }),
        confirmPassword: z.string().min(1, { message: 'Please confirm password' })
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    });

const CompleteResetPasswordForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: '',
            password: '',
            confirmPassword: ''
        }
    });

    const [state, dispatch] = useReducer(submitButtonReducer, { isLoading: false, isSuccess: false, isError: false });
    const [submitData, setSubmitData] = useState<SetActiveParams>();
    const { isLoaded: isClerkLoaded, signIn, setActive } = useSignIn();
    const router = useRouter();
    const { toast } = useToast();

    const clerkErrorFieldMap = new Map<string, keyof z.infer<typeof formSchema>>([
        ['code', 'code'],
        ['password', 'password']
    ]);

    const onSubmit = async ({ code, password }: z.infer<typeof formSchema>) => {
        if (!signIn) return;
        dispatch({ type: 'loading' });

        try {
            const { status, createdSessionId } = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password
            });

            if (status === 'complete' && createdSessionId) {
                dispatch({ type: 'success' });
                setSubmitData({ session: createdSessionId });
            }
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
                        <CardTitle>Reset Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <CardDescription className="pb-5">
                                        We have sent you a verification code to your email address. Please enter the code below:
                                    </CardDescription>
                                    <FormLabel>Code</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
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
                            name="confirmPassword"
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

export default CompleteResetPasswordForm;
