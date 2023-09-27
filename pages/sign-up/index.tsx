import { env } from '@/env.mjs';
import Head from 'next/head';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import CodeVerificationForm from '@/components/ui/custom/forms/code-verification-form';
import SignUpForm from '@/components/ui/custom/forms/sign-up-form';
import { cn } from '@/lib/utils';

export default () => {
    const [summaryErrors, setSummaryErrors] = useState<{ id: string; message: string }[]>([]);
    const [pendingVerification, setPendingVerification] = useState(false);

    return (
        <>
            <Head>
                <title>{`Sign Up | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex h-3/5 flex-col items-center justify-end">
                <div className="flex w-96 flex-col gap-5">
                    {summaryErrors.length > 0 && (
                        <Alert className="text-destructive">
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
                    )}
                    <div className="w-[400px] overflow-hidden">
                        <div
                            className={cn('grid grid-cols-[repeat(2,_400px)] transition-transform', {
                                '-translate-x-full': pendingVerification
                            })}
                        >
                            <SignUpForm setSummaryErrors={setSummaryErrors} setPendingVerification={setPendingVerification} />
                            <CodeVerificationForm setSummaryErrors={setSummaryErrors} />
                        </div>
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
