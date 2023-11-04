import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, isKnownError, useSignUp } from '@clerk/nextjs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import SubmitButton from '@/components/ui/custom/submit-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

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
    setOrganizationName: Dispatch<SetStateAction<string | undefined>>;
};

const SignUpForm = ({ nextStep, setOrganizationName }: Props) => {
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

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { signUp, isLoaded: isClerkLoaded } = useSignUp();
    const { toast } = useToast();

    const clerkErrorFieldMap = new Map<string, keyof z.infer<typeof formSchema>>([
        ['email_address', 'email'],
        ['identifier', 'email'],
        ['first_name', 'firstName'],
        ['last_name', 'lastName'],
        ['password', 'password']
    ]);

    const onSubmit = async ({ email, password, firstName, lastName, organizationName }: z.infer<typeof formSchema>) => {
        if (!signUp) return;
        setIsLoading(true);

        try {
            await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

            setIsSuccess(true);
            setOrganizationName(organizationName);
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

    const renderForm = (accountType: 'personal' | 'business') => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
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
                                    <FormMessage />
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
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm password</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
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
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2">
                        <CardDescription>
                            Already have an account?
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

    if (!isClerkLoaded) return null;

    return (
        <Tabs defaultValue="personal">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
            </TabsList>
            {(['personal', 'business'] as const).map((accountType) => (
                <TabsContent key={accountType} value={accountType}>
                    {renderForm(accountType)}
                </TabsContent>
            ))}
        </Tabs>
    );
};

export default SignUpForm;
