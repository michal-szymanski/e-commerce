import { AnimatePresence, motion } from 'framer-motion';
import SummaryErrors from '@/components/ui/custom/summary-errors';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/ui/custom/submit-button';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, useSignIn } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { SetActiveParams } from '@clerk/types';
import { useRouter } from 'next/router';

const formSchema = z
    .object({
        code: z.string().nonempty({ message: 'Code is required' }),
        password: z.string().nonempty({ message: 'Password is required' }),
        confirmPassword: z.string().nonempty({ message: 'Please confirm password' })
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

    const [isLoading, setIsLoading] = useState(false);
    const [submitData, setSubmitData] = useState<SetActiveParams>();
    const { isLoaded: isClerkLoaded, signIn, setActive } = useSignIn();
    const router = useRouter();
    const [summaryErrors, setSummaryErrors] = useState<{ id: string; message: string }[]>([]);

    const onSubmit = async ({ code, password }: z.infer<typeof formSchema>) => {
        if (!signIn) return;
        setSummaryErrors([]);
        setIsLoading(true);

        try {
            const { status, createdSessionId } = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password
            });

            if (status === 'complete' && createdSessionId) {
                setSubmitData({ session: createdSessionId });
            }
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                setSummaryErrors(error.errors.map((e) => ({ id: e.code, message: e.longMessage ?? e.message })));
            } else {
                setSummaryErrors([{ id: uuidv4(), message: 'There was an error while submitting the form. Please try again.' }]);
            }
        }

        setIsLoading(false);
    };

    if (!isClerkLoaded) return null;

    return (
        <div className="flex flex-col gap-5">
            <div className="min-h-[100px]">
                <AnimatePresence>
                    {summaryErrors.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="summary-errors">
                            <SummaryErrors errors={summaryErrors} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="">
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
                                        <div className="h-5">
                                            <FormMessage />
                                        </div>
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
                                        <div className="h-5">
                                            <FormMessage />
                                        </div>
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
                                isSuccess={!!submitData}
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
        </div>
    );
};

export default CompleteResetPasswordForm;
