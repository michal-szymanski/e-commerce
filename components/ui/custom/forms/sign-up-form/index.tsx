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
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SummaryErrors from '@/components/ui/custom/summary-errors';
import { v4 as uuidv4 } from 'uuid';

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
    const [summaryErrors, setSummaryErrors] = useState<{ id: string; message: string }[]>([]);

    const onSubmit = async ({ email, password, firstName, lastName, organizationName }: z.infer<typeof formSchema>) => {
        if (!signUp) return;
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

            setIsSuccess(true);
            setOrganizationName(organizationName);
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                setSummaryErrors(error.errors.map((e) => ({ id: e.code, message: e.longMessage ?? e.message })));
            } else {
                setSummaryErrors([{ id: uuidv4(), message: 'There was an error while submitting the form. Please try again.' }]);
            }
        }
        setIsLoading(false);
    };

    const renderForm = (accountType: 'personal' | 'business') => (
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
                                    <FormLabel>Confirm password</FormLabel>
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
    );

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
        </div>
    );
};

export default SignUpForm;
