import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/ui/custom/submit-button';
import { AnimatePresence, motion } from 'framer-motion';
import { SetActiveParams } from '@clerk/types';
import SummaryErrors from '@/components/ui/custom/summary-errors';

const formSchema = z.object({
    code: z.string().nonempty({ message: 'Code is required' })
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

    const [isLoading, setIsLoading] = useState(false);
    const [submitData, setSubmitData] = useState<SetActiveParams>();
    const { signUp, setActive, isLoaded: isClerkLoaded } = useSignUp();
    const [summaryErrors, setSummaryErrors] = useState<{ id: string; message: string }[]>([]);

    const router = useRouter();

    const onSubmit = async ({ code }: z.infer<typeof formSchema>) => {
        if (!signUp) return;
        setSummaryErrors([]);
        setIsLoading(true);

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

                setSubmitData(sessionData);
            }
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                setSummaryErrors(error.errors.map((e) => ({ id: e.code, message: e.longMessage ?? e.message })));
            }
        }

        setIsLoading(false);
    };

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
            <Form {...form}>
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
                        <CardFooter>
                            <SubmitButton
                                key={form.formState.submitCount}
                                isLoading={isLoading}
                                isSuccess={!!submitData}
                                onComplete={() =>
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
        </div>
    );
};

export default CodeVerificationForm;
