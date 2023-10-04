import { AnimatePresence, motion } from 'framer-motion';
import CreateOrganizationForm from '@/components/ui/custom/forms/create-organization-form';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';

const Page = () => {
    const [summaryErrors, setSummaryErrors] = useState<{ id: string; message: string }[]>([]);
    return (
        <>
            <Head>
                <title>{`Create Organization | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
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
                    <div className="relative">
                        <div className="absolute left-1/2 top-0  w-[400px] -translate-x-1/2">
                            <CreateOrganizationForm setSummaryErrors={setSummaryErrors} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
    const { orgId } = getAuth(context.req);

    if (orgId) {
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
