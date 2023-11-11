import { env } from '@/env.mjs';
import Head from 'next/head';
import { ReactNode, useState } from 'react';

import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import CodeVerificationForm from '@/components/ui/custom/forms/auth/code-verification-form';
import SignUpForm from '@/components/ui/custom/forms/auth/sign-up-form';
import { AnimatePresence, motion } from 'framer-motion';
import DefaultLayout from '@/components/layouts/default-layout';

const Page = () => {
    const [step, setStep] = useState(0);
    const [organizationName, setOrganizationName] = useState<string | undefined>();

    return (
        <>
            <Head>
                <title>{`Sign Up | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex flex-col items-center">
                <div className="relative w-full max-w-[400px]">
                    <AnimatePresence>
                        {step === 0 && (
                            <motion.div
                                initial={{ translateX: '-50%', opacity: 1 }}
                                exit={{ translateX: '-150%', opacity: 0 }}
                                key="tabs"
                                className="absolute left-1/2 top-0 w-full"
                            >
                                <SignUpForm nextStep={() => setStep((prev) => prev + 1)} setOrganizationName={setOrganizationName} />
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
                                <CodeVerificationForm organizationName={organizationName} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

Page.getLayout = (page: ReactNode) => {
    return <DefaultLayout>{page}</DefaultLayout>;
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
