import { env } from '@/env.mjs';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import InitResetPasswordForm from '@/components/ui/custom/forms/init-reset-password-form';
import CompleteResetPasswordForm from '@/components/ui/custom/forms/complete-reset-password-form';

const Page = () => {
    const [step, setStep] = useState(0);

    return (
        <>
            <Head>
                <title>{`Reset Password | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            <div className="container flex h-1/5 w-[400px] flex-col items-center justify-end">
                <div className="relative w-[400px]">
                    <AnimatePresence>
                        {step === 0 && (
                            <motion.div
                                initial={{ translateX: '-50%', opacity: 1 }}
                                exit={{ translateX: '-150%', opacity: 0 }}
                                key="tabs"
                                className="absolute left-1/2 top-0 w-full"
                            >
                                <InitResetPasswordForm nextStep={() => setStep((prev) => prev + 1)} />
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
                                <CompleteResetPasswordForm />
                            </motion.div>
                        )}
                    </AnimatePresence>
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
