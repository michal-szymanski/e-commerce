import { isClerkAPIResponseError } from '@clerk/nextjs';
import { env } from '@/env.mjs';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import Link from 'next/link';
import SubmitButton from '@/components/ui/custom/submit-button';
import { AnimatePresence, motion } from 'framer-motion';
import SummaryErrors from '@/components/ui/custom/summary-errors';

const formSchema = z.object({
    email: z.string().nonempty({ message: 'Email is required' }).email(),
    password: z.string().nonempty({ message: 'Password is required' })
});

const Page = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { signIn, setActive, isLoaded: isClerkLoaded } = useSignIn();
    const router = useRouter();
    const [summaryErrors, setSummaryErrors] = useState<{ id: string; message: string }[]>([]);

    const onSubmit = async ({ email, password }: z.infer<typeof formSchema>) => {
        if (!signIn) return;
        setSummaryErrors([]);
        setIsLoading(true);

        try {
            const signInResult = await signIn.create({
                identifier: email,
                password
            });

            if (signInResult.status === 'complete') {
                setIsSuccess(true);
                await setActive({ session: signInResult.createdSessionId });
            }
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                setSummaryErrors(error.errors.map((e) => ({ id: e.code, message: e.message })));
            }
        }

        setIsLoading(false);
    };

    if (!isClerkLoaded) return null;

    return (
        <>
            <Head>
                <title>{`Sign In | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex h-1/5 w-[400px] flex-col items-center justify-end">
                <div className="w-[400px]">
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
                                </CardContent>
                                <CardFooter className="flex flex-col items-start gap-2">
                                    <CardDescription>
                                        {`Don't`} have an account?
                                        <Link href="/sign-up">
                                            <Button type="button" variant="link">
                                                Sign up
                                            </Button>
                                        </Link>
                                    </CardDescription>
                                    <SubmitButton isLoading={isLoading} isSuccess={isSuccess} onComplete={() => setTimeout(() => router.push('/'), 1000)} />
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </div>
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

export default Page;