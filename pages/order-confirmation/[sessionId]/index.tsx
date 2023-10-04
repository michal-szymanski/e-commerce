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
import { v4 as uuidv4 } from 'uuid';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { ordersTable } from '@/schema';
import { eq } from 'drizzle-orm';
import { orderSchema } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Page = ({ orderId, firstName }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
    const [confettiIds, setConfettiIds] = useState<string[]>([uuidv4()]);

    useEffect(() => {
        const eventHandler = () => {
            setDimensions({ width: window.innerWidth, height: innerHeight });
        };

        eventHandler();

        window.addEventListener('resize', eventHandler);
        return () => window.removeEventListener('resize', eventHandler);
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
            <div className="container grid h-[60%] place-items-center">
                <Card className="border-green-300 bg-green-100 text-green-950">
                    <CardHeader>
                        <CardTitle>Thank you{firstName ? `, ${firstName}` : ''}!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">
                            Your order number{' '}
                            {
                                <Link href={`/orders/${orderId}`} className="font-bold underline">
                                    {orderId}
                                </Link>
                            }{' '}
                            has been created.
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
                                <Link href="/">
                                    <Button>Home Page</Button>
                                </Link>
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

export const getServerSideProps: GetServerSideProps<{ orderId: number; firstName: string | null }> = async (context) => {
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
    const orderId = z.coerce.number().parse(session.metadata.orderId);
    const client = postgres(env.CONNECTION_STRING);
    const db = drizzle(client);
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    await client.end();
    const order = z.array(orderSchema).length(1).parse(orders)[0];

    if (order.userId !== userId) {
        return {
            redirect: {
                destination: '/sign-in',
                permanent: false
            }
        };
    }

    return {
        props: {
            orderId,
            firstName
        }
    };
};

export default Page;
