import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
    code: z.string()
});

type Props = {
    setSummaryErrors: Dispatch<SetStateAction<{ id: string; message: string }[]>>;
};

const CodeVerificationForm = ({ setSummaryErrors }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: ''
        }
    });

    const { signUp, setActive } = useSignUp();
    const router = useRouter();

    const onSubmit = async ({ code }: z.infer<typeof formSchema>) => {
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

    return (
        <Form {...form} key="code-verification-form">
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="">
                    <CardHeader>
                        <CardTitle>Verify email</CardTitle>
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
};

export default CodeVerificationForm;
