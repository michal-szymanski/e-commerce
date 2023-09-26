import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import stripe from '@/stripe';
import Link from 'next/link';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import Confetti from 'react-confetti';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { env } from '@/env.mjs';

export default ({ session, firstName }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const eventHandler = () => {
            setDimensions({ width: window.innerWidth, height: innerHeight });
        };
        eventHandler();
        window.addEventListener('resize', eventHandler);
        return () => window.removeEventListener('resize', eventHandler);
    }, []);

    const orderId = session.metadata.orderId;

    return (
        <>
            <Head>
                <title>Order Confirmation | {env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <Confetti width={width} height={height} numberOfPieces={500} recycle={false} />
            <div className="container grid h-[60%] place-items-center">
                <div>
                    <h2 className="text-3xl font-bold">Thank you, {firstName}!</h2>
                    <p className="py-5 text-xl">
                        Your order number{' '}
                        {
                            <Link href={`/orders/${orderId}`} className="font-bold underline">
                                {orderId}
                            </Link>
                        }{' '}
                        has been created.
                    </p>
                    <p className="pb-2 text-lg">
                        You should receive an order confirmation email shortly. If the email hasn't arrived within few minutes, please check your spam folder to
                        see if the email was routed there.
                    </p>
                    <p className="text-lg">
                        Feel free to close this page or head back to the{' '}
                        {
                            <Link href="/">
                                <Button>Home Page</Button>
                            </Link>
                        }{' '}
                        .
                    </p>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{ session: any; firstName: string | null }> = async (context) => {
    const { userId } = getAuth(context.req);

    if (!userId) {
        return {
            redirect: {
                destination: '/sign-in',
                permanent: false
            }
        };
    }

    const user = await clerkClient.users.getUser(userId);
    const sessionId = z.string().parse(context.query.sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['customer'] });

    return {
        props: {
            session,
            firstName: user.firstName
        }
    };
};
