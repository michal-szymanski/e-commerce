import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { SetActiveParams } from '@clerk/types';
import { isClerkAPIResponseError, isKnownError, useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SubmitButton from '@/components/ui/custom/submit-button';
import { useToast } from '@/components/ui/use-toast';
import { saveCartToLocalStorage } from '@/services/local-storage-service';

const formSchema = z.object({
    email: z.string().nonempty({ message: 'Email is required' }).email(),
    password: z.string().nonempty({ message: 'Password is required' })
});

const SignInForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [submitData, setSubmitData] = useState<SetActiveParams>();
    const { signIn, setActive, isLoaded: isClerkLoaded } = useSignIn();
    const router = useRouter();

    const { toast } = useToast();

    const clerkErrorFieldMap = new Map<string, keyof z.infer<typeof formSchema>>([
        ['email_address', 'email'],
        ['identifier', 'email'],
        ['password', 'password']
    ]);

    const onSubmit = async ({ email, password }: z.infer<typeof formSchema>) => {
        if (!signIn) return;
        setIsLoading(true);

        try {
            const { status, createdSessionId } = await signIn.create({
                identifier: email,
                password
            });

            if (status === 'complete' && createdSessionId) {
                setSubmitData({ session: createdSessionId });
            }
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
                        <CardTitle>Sign In</CardTitle>
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
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2">
                        <CardDescription>
                            {`Don't`} have an account?
                            <Button type="button" variant="link" asChild>
                                <Link href="/sign-up">Sign up</Link>
                            </Button>
                        </CardDescription>
                        <CardDescription>
                            Forgot your password?
                            <Button type="button" variant="link" asChild>
                                <Link href="/reset-password">Reset it</Link>
                            </Button>
                        </CardDescription>
                        <SubmitButton
                            isLoading={isLoading}
                            isSuccess={!!submitData}
                            onAnimationComplete={() =>
                                setTimeout(async () => {
                                    if (!submitData) return;
                                    saveCartToLocalStorage([]);
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

export default SignInForm;
