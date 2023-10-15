import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import stripe from '@/lib/stripe';
import Link from 'next/link';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import Confetti from 'react-confetti';
import { ElementRef, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { v4 as uuidv4 } from 'uuid';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { ordersTable } from '@/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { orderSchema } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Page = ({ orderIds, firstName }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
    const [confettiIds, setConfettiIds] = useState<string[]>([uuidv4()]);
    const ref = useRef<ElementRef<'div'>>(null);

    useEffect(() => {
        const setConfettiDimensions = () => {
            if (!ref.current?.parentElement) return;
            const { offsetWidth: width, offsetHeight: height } = ref.current?.parentElement;
            setDimensions({ width, height });
        };

        setConfettiDimensions();

        window.addEventListener('resize', setConfettiDimensions);
        return () => window.removeEventListener('resize', setConfettiDimensions);
    }, []);

    return (
        <>
            <Head>
                <title>{`Order Confirmation | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
            </Head>
            {confettiIds.map((id) => (
                <Confetti
                    key={id}
                    width={width}
                    height={height}
                    numberOfPieces={500}
                    recycle={false}
                    tweenDuration={10000}
                    onConfettiComplete={() => {
                        setConfettiIds((prev) => prev.filter((prevId) => prevId !== id));
                    }}
                />
            ))}
            <div className="container grid h-[60%] place-items-center" ref={ref}>
                <Card className="border-green-300 bg-green-100 text-green-950">
                    <CardHeader>
                        <CardTitle>Thank you{firstName ? `, ${firstName}` : ''}!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">
                            Your {orderIds.length > 0 ? 'orders' : 'order'} number{' '}
                            {orderIds.map((orderId, index) => (
                                <span key={orderId}>
                                    <Link href={`/orders/${orderId}`} className="font-bold underline">
                                        {orderId}
                                    </Link>
                                    {index === orderIds.length - 1 ? ' ' : ', '}
                                </span>
                            ))}{' '}
                            {orderIds.length > 0 ? 'have' : 'has'} been created.
                        </p>
                        <p className="text-lg">
                            You should receive an order confirmation email shortly. If the email {`hasn't`} arrived within few minutes, please check your spam
                            folder to see if the email was routed there.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start">
                        <p className="text-lg">
                            You can safely close this page or head back to the{' '}
                            {
                                <Button asChild>
                                    <Link href="/">Home Page</Link>
                                </Button>
                            }
                        </p>

                        <p className="select-none text-lg">
                            And if you like confetti{' '}
                            <Button
                                disabled={confettiIds.length === 10}
                                variant="outline"
                                onClick={() => {
                                    if (confettiIds.length === 10) return;
                                    setConfettiIds((prev) => [...prev, uuidv4()]);
                                }}
                            >
                                Click here
                            </Button>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<{ orderIds: number[]; firstName: string | null }> = async (context) => {
    const { userId } = getAuth(context.req);

    if (!userId) {
        return {
            redirect: {
                destination: '/sign-in',
                permanent: false
            }
        };
    }

    const { firstName } = await clerkClient.users.getUser(userId);

    const sessionId = z.string().parse(context.query.sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderIds = z.array(z.number()).parse(JSON.parse(session.metadata?.orderIds as string));

    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);
    const orders = await db
        .select()
        .from(ordersTable)
        .where(and(inArray(ordersTable.id, orderIds), eq(ordersTable.userId, userId)));
    await client.end();

    if (!orders.length) {
        return {
            redirect: {
                destination: '/sign-in',
                permanent: false
            }
        };
    }

    return {
        props: {
            orderIds: z
                .array(orderSchema)
                .parse(orders)
                .map((o) => o.id),
            firstName
        }
    };
};

export default Page;
