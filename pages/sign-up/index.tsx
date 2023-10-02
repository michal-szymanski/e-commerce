import { env } from '@/env.mjs';
import Head from 'next/head';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import CodeVerificationForm from '@/components/ui/custom/forms/code-verification-form';
import SignUpForm from '@/components/ui/custom/forms/sign-up-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Page = () => {
    const [summaryErrors, setSummaryErrors] = useState<{ id: string; message: string }[]>([]);
    const [step, setStep] = useState(0);
    const [organizationName, setOrganizationName] = useState<string | undefined>();

    return (
        <>
            <Head>
                <title>{`Sign Up | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex h-1/5 w-[400px] flex-col items-center justify-end">
                <div className="flex flex-col gap-5">
                    <AnimatePresence>
                        {summaryErrors.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="summary-errors">
                                <Alert className="w-[400px] text-destructive">
                                    <ExclamationCircleIcon className="h-5 w-5 !text-destructive" />
                                    <AlertTitle>Heads up!</AlertTitle>
                                    <AlertDescription>
                                        {summaryErrors.map((e) => (
                                            <p key={e.id} className="text-sm font-medium">
                                                {e.message}
                                            </p>
                                        ))}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="relative w-[400px]">
                        <AnimatePresence>
                            {step === 0 && (
                                <motion.div
                                    initial={{ translateX: '-50%', opacity: 1 }}
                                    exit={{ translateX: '-150%', opacity: 0 }}
                                    key="tabs"
                                    className="absolute left-1/2 top-0 w-full"
                                >
                                    <Tabs defaultValue="personal">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="personal">Personal</TabsTrigger>
                                            <TabsTrigger value="business">Business</TabsTrigger>
                                        </TabsList>
                                        {(['personal', 'business'] as const).map((accountType) => (
                                            <TabsContent key={accountType} value={accountType}>
                                                <SignUpForm
                                                    nextStep={() => setStep((prev) => prev + 1)}
                                                    setSummaryErrors={setSummaryErrors}
                                                    setOrganizationName={setOrganizationName}
                                                    accountType={accountType}
                                                />
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </motion.div>
                            )}
                            {step === 1 && (
                                <motion.div
                                    initial={{ translateX: '50%', opacity: 0 }}
                                    animate={{ translateX: '-50%', opacity: 1 }}
                                    exit={{ translateX: '-150%', opacity: 0 }}
                                    key="code-verification-form"
                                    className="absolute left-1/2 top-0 w-full"
                                >
                                    <CodeVerificationForm setSummaryErrors={setSummaryErrors} organizationName={organizationName} />
                                </motion.div>
                            )}
                        </AnimatePresence>
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