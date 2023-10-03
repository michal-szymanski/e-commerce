import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, useSignUp } from '@clerk/nextjs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import SubmitButton from '@/components/ui/custom/submit-button';

const formSchema = z
    .object({
        firstName: z.string().nonempty({ message: 'First name is required' }),
        lastName: z.string().nonempty({ message: 'Last name is required' }),
        email: z.string().nonempty({ message: 'Email is required' }).email(),
        password: z.string().nonempty({ message: 'Password is required' }),
        confirmPassword: z.string().nonempty({ message: 'Please confirm password' }),
        organizationName: z.string().nonempty({ message: 'Organization name is required' }).optional(),
        termsAccepted: z.literal<boolean>(true, {
            errorMap: () => ({ message: 'Your consent is required' })
        })
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    });

type Props = {
    nextStep: () => void;
    setSummaryErrors: Dispatch<SetStateAction<{ id: string; message: string }[]>>;
    setOrganizationName: Dispatch<SetStateAction<string | undefined>>;
    accountType: 'personal' | 'business';
};

const SignUpForm = ({ nextStep, setSummaryErrors, setOrganizationName, accountType }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            organizationName: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            termsAccepted: false
        },
        shouldUnregister: true
    });

    const { signUp, isLoaded: isClerkLoaded } = useSignUp();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const onSubmit = async ({ email, password, firstName, lastName, organizationName }: z.infer<typeof formSchema>) => {
        if (!signUp || isSuccess) return;
        setSummaryErrors([]);
        setIsLoading(true);

        try {
            await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

            setOrganizationName(organizationName);
            setIsSuccess(true);
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                setSummaryErrors(error.errors.map((e) => ({ id: e.code, message: e.longMessage ?? e.message })));
            }
        }

        setIsLoading(false);
    };

    if (!isClerkLoaded) return null;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="">
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {accountType === 'business' && (
                            <FormField
                                control={form.control}
                                name="organizationName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Organization name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <div className="h-5">
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First name</FormLabel>
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
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last name</FormLabel>
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
                        <FormField
                            control={form.control}
                            name="termsAccepted"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                I accept the{' '}
                                                <Link href="/terms-of-use" className="text-card-foreground underline">
                                                    terms of use
                                                </Link>{' '}
                                                and{' '}
                                                <Link href="/privacy-policy" className="text-card-foreground underline">
                                                    privacy policy
                                                </Link>
                                            </FormLabel>
                                        </div>
                                        <div className="h-5">
                                            <FormMessage />
                                        </div>
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
                        <div className="relative w-full">
                            <SubmitButton isLoading={isLoading} isSuccess={isSuccess} onComplete={() => setTimeout(nextStep, 2000)} />
                        </div>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default SignUpForm;
