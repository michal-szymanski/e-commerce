import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, useSignUp } from '@clerk/nextjs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction } from 'react';

const formSchema = z
    .object({
        email: z.string().nonempty({ message: 'Email is required' }).email(),
        password: z.string().nonempty({ message: 'Password is required' }),
        confirmPassword: z.string().nonempty({ message: 'Please confirm password' })
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    });

type Props = {
    setSummaryErrors: Dispatch<SetStateAction<{ id: string; message: string }[]>>;
    setPendingVerification: Dispatch<SetStateAction<boolean>>;
};

const SignUpForm = ({ setSummaryErrors, setPendingVerification }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    });
    const { signUp } = useSignUp();

    const onSubmit = async ({ email, password }: z.infer<typeof formSchema>) => {
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

    return (
        <Form {...form} key="sign-up-form">
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="">
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
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
                        <FormField
                            control={form.control}
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

export default SignUpForm;
