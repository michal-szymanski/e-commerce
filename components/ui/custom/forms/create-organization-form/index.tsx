import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isClerkAPIResponseError, useOrganizationList } from '@clerk/nextjs';
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/router';
import SubmitButton from '@/components/ui/custom/submit-button';
import { SetActiveParams } from '@clerk/types';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import SummaryErrors from '@/components/ui/custom/summary-errors';

const formSchema = z.object({
    name: z.string().nonempty({ message: 'Name is required' })
});

const CreateOrganizationForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ''
        }
    });

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [submitData, setSubmitData] = useState<SetActiveParams>();
    const { createOrganization, isLoaded: isClerkLoaded, setActive } = useOrganizationList();
    const [summaryErrors, setSummaryErrors] = useState<{ id: string; message: string }[]>([]);

    const onSubmit = async ({ name }: z.infer<typeof formSchema>) => {
        if (!createOrganization) return;
        setSummaryErrors([]);
        setIsLoading(true);

        try {
            const organization = await createOrganization({
                name
            });

            setSubmitData({ organization });
        } catch (error) {
            if (isClerkAPIResponseError(error)) {
                setSummaryErrors(error.errors.map((e) => ({ id: e.code, message: e.longMessage ?? e.message })));
            } else {
                setSummaryErrors([{ id: uuidv4(), message: 'There was an error while submitting the form. Please try again.' }]);
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Organization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
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
                            <SubmitButton
                                key={form.formState.submitCount}
                                isLoading={isLoading}
                                isSuccess={!!submitData}
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
        </div>
    );
};

export default CreateOrganizationForm;
