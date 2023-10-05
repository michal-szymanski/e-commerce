import { AnimatePresence, motion } from 'framer-motion';
import SummaryErrors from '@/components/ui/custom/summary-errors';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SubmitButton from '@/components/ui/custom/submit-button';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, useSignIn } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
    email: z.string().nonempty({ message: 'Email is required' }).email()
});

type Props = {
    nextStep: () => void;
};

const InitResetPasswordForm = ({ nextStep }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ''
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { isLoaded: isClerkLoaded, signIn } = useSignIn();
    const [summaryErrors, setSummaryErrors] = useState<{ id: string; message: string }[]>([]);

    const onSubmit = async ({ email }: z.infer<typeof formSchema>) => {
        if (!signIn) return;
        setSummaryErrors([]);
        setIsLoading(true);

        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email
            });

            setIsSuccess(true);
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
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
                            <CardDescription>
                                Remember your password?
                                <Link href="/sign-in">
                                    <Button type="button" variant="link">
                                        Sign in
                                    </Button>
                                </Link>
                            </CardDescription>
                            <SubmitButton
                                key={form.formState.submitCount}
                                isLoading={isLoading}
                                isSuccess={isSuccess}
                                onAnimationComplete={() => setTimeout(nextStep, 1000)}
                            />
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
};

export default InitResetPasswordForm;
