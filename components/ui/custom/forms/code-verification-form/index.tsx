import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, isKnownError, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useReducer, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/ui/custom/submit-button';
import { SetActiveParams } from '@clerk/types';
import { useToast } from '@/components/ui/use-toast';
import submitButtonReducer from '@/components/ui/custom/submit-button/reducer';

const formSchema = z.object({
    code: z.string().min(1, { message: 'Code is required' })
});

type Props = {
    organizationName?: string;
};

const CodeVerificationForm = ({ organizationName }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: ''
        }
    });

    const [state, dispatch] = useReducer(submitButtonReducer, { isLoading: false, isSuccess: false, isError: false });
    const [submitData, setSubmitData] = useState<SetActiveParams>();
    const { signUp, setActive, isLoaded: isClerkLoaded } = useSignUp();
    const router = useRouter();
    const { toast } = useToast();

    const clerkErrorFieldMap = new Map<string, keyof z.infer<typeof formSchema>>([['code', 'code']]);

    const onSubmit = async ({ code }: z.infer<typeof formSchema>) => {
        if (!signUp) return;
        dispatch({ type: 'loading' });

        try {
            const { status, createdSessionId, createdUserId } = await signUp.attemptEmailAddressVerification({
                code
            });

            let sessionData: SetActiveParams;

            if (status === 'complete' && createdSessionId) {
                sessionData = { session: createdSessionId };

                if (organizationName) {
                    const { organizationId } = (await (
                        await fetch('/api/organizations', {
                            method: 'POST',
                            body: JSON.stringify({ userId: createdUserId, organizationName }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                    ).json()) as { organizationId: string };

                    sessionData = { ...sessionData, organization: organizationId };
                }
                dispatch({ type: 'success' });
                setSubmitData(sessionData);
            }
        } catch (error) {
            dispatch({ type: 'error' });
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <SubmitButton
                            state={state}
                            onAnimationComplete={() =>
                                setTimeout(async () => {
                                    if (!submitData) return;
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

export default CodeVerificationForm;
