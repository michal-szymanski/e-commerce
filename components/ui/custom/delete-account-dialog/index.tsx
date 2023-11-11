import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useReducer, useState } from 'react';
import submitButtonReducer from '@/components/ui/custom/submit-button/reducer';
import { isClerkAPIResponseError, isKnownError, useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SubmitButton from '@/components/ui/custom/submit-button';
import { useRouter } from 'next/router';

const formSchema = z.object({
    fullName: z.string().min(1, { message: 'Your full name is required' })
});

const DeleteAccountDialog = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: ''
        }
    });

    const [state, dispatch] = useReducer(submitButtonReducer, { isLoading: false, isSuccess: false, isError: false });
    const { user, isLoaded: isClerkLoaded } = useUser();
    const [isDisabled, setIsDisabled] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const clerkErrorFieldMap = new Map<string, keyof z.infer<typeof formSchema>>([]);

    useEffect(() => {
        const subscription = form.watch(({ fullName }) => {
            setIsDisabled(fullName !== user?.fullName);
        });
        return () => subscription.unsubscribe();
    }, [form, user]);

    const onSubmit = async ({ fullName }: z.infer<typeof formSchema>) => {
        if (!user || user.fullName !== fullName) return;

        dispatch({ type: 'loading' });

        try {
            await user.delete();
            dispatch({ type: 'success' });
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
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                    Delete Account
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            <AlertDialogDescription>
                                This will <span className="font-bold">permanently</span> delete your account and remove your data from our servers.
                            </AlertDialogDescription>
                            <AlertDialogDescription>To continue please provide your full name.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your full name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <SubmitButton
                                state={state}
                                onAnimationComplete={() => setTimeout(async () => router.push('/'), 1000)}
                                className="disabled:opacity-50 md:w-40"
                                disabled={isDisabled}
                            />
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteAccountDialog;
