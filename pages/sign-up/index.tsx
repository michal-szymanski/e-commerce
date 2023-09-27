import { isClerkAPIResponseError, useSignUp } from '@clerk/nextjs';
import { env } from '@/env.mjs';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import Link from 'next/link';

const signUpFormSchema = z
    .object({
        email: z.string().nonempty({ message: 'Email is required' }).email(),
        password: z.string().nonempty({ message: 'Password is required' }),
        confirmPassword: z.string().nonempty({ message: 'Please confirm password' })
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    });

const codeVerificationFormSchema = z.object({
    code: z.string()
});

export default () => {
    const signUpForm = useForm<z.infer<typeof signUpFormSchema>>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const codeVerificationForm = useForm<z.infer<typeof codeVerificationFormSchema>>({
        resolver: zodResolver(codeVerificationFormSchema),
        defaultValues: {
            code: ''
        }
    });

    const { signUp, setActive } = useSignUp();
    const router = useRouter();
    const [summaryErrors, setSummaryErrors] = useState<{ id: string; message: string }[]>([]);
    const [pendingVerification, setPendingVerification] = useState(false);

    const onSignUpSubmit = async ({ email, password }: z.infer<typeof signUpFormSchema>) => {
        if (!signUp) return;
        setSummaryErrors([]);

        try {
            await signUp.create({
                emailAddress: email,
                password
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                setSummaryErrors(error.errors.map((e) => ({ id: e.code, message: e.longMessage ?? e.message })));
                return;
            }

            console.error({ error });
        }
    };

    const onCodeVerificationSubmit = async ({ code }: z.infer<typeof codeVerificationFormSchema>) => {
        if (!signUp) return;
        setSummaryErrors([]);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code
            });
            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                await router.push('/');
            }
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                setSummaryErrors(error.errors.map((e) => ({ id: e.code, message: e.longMessage ?? e.message })));
                return;
            }

            console.error({ error });
        }
    };

    const renderForms = () => {
        if (pendingVerification) {
            return (
                <Form {...codeVerificationForm} key="code-verification-form">
                    <form onSubmit={codeVerificationForm.handleSubmit(onCodeVerificationSubmit)}>
                        <Card className="">
                            <CardHeader>
                                <CardTitle>Verify email</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={codeVerificationForm.control}
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
        }

        return (
            <Form {...signUpForm} key="sign-up-form">
                <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}>
                    <Card className="">
                        <CardHeader>
                            <CardTitle>Sign Up</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={signUpForm.control}
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
                            <FormField
                                control={signUpForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
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
                                control={signUpForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
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
                            <CardDescription>
                                Already have an account?
                                <Link href="/sign-in">
                                    <Button type="button" variant="link">
                                        Sign in
                                    </Button>
                                </Link>
                            </CardDescription>
                            <Button type="submit" className="w-full">
                                Submit
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        );
    };

    return (
        <>
            <Head>
                <title>{`Sign Up | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex h-3/5 flex-col items-center justify-end">
                <div className="flex w-96 flex-col gap-5">
                    {summaryErrors.length > 0 && (
                        <Alert className="text-destructive">
                            <ExclamationCircleIcon className="h-5 w-5 !text-destructive" />
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>
                                {summaryErrors.map((e) => (
                                    <p key={e.id} className="text-sm font-medium">
                                        {e.message}
                                    </p>
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}
                    {renderForms()}
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
    const { userId } = getAuth(context.req);

    if (userId) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    return {
        props: {}
    };
};
