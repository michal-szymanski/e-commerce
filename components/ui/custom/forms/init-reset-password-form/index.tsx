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
import { isClerkAPIResponseError, isKnownError, useSignIn } from '@clerk/nextjs';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
    email: z.string().min(1, { message: 'Email is required' }).email()
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
    const { toast } = useToast();

    const clerkErrorFieldMap = new Map<string, keyof z.infer<typeof formSchema>>([
        ['email_address', 'email'],
        ['identifier', 'email']
    ]);

    const onSubmit = async ({ email }: z.infer<typeof formSchema>) => {
        if (!signIn) return;
        setIsLoading(true);

        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email
            });

            setIsSuccess(true);
        } catch (error) {
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
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2">
                        <CardDescription>
                            Remember your password?
                            <Button type="button" variant="link" asChild>
                                <Link href="/sign-in">Sign in</Link>
                            </Button>
                        </CardDescription>
                        <SubmitButton isLoading={isLoading} isSuccess={isSuccess} onAnimationComplete={() => setTimeout(nextStep, 1000)} />
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default InitResetPasswordForm;
