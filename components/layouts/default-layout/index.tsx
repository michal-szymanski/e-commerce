import { ReactNode } from 'react';
import Navbar from '@/components/layouts/navbar';
import CartFooter from '@/components/layouts/cart-footer';
import { env } from '@/env.mjs';
import Head from 'next/head';
import { useCart } from '@/hooks/queries';
import { useOrganization, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

type Props = {
    children: ReactNode;
};

const inter = Inter({ subsets: ['latin'] });

const DefaultLayout = ({ children }: Props) => {
    const { isSignedIn } = useUser();
    const { organization } = useOrganization();
    const { data: cart } = useCart(!!isSignedIn && !organization);

    return (
        <>
            <Head>
                <title>{env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <Navbar />
            <main
                className={cn(`absolute bottom-0 left-0 right-0 top-[120px] overflow-y-auto md:top-[70px] md:pt-[100px] ${inter.className}`, {
                    'bottom-28': cart && cart.length > 0
                })}
            >
                {children}
            </main>
            <Toaster />
            <CartFooter />
        </>
    );
};

export default DefaultLayout;
